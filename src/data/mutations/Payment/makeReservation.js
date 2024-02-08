// GrpahQL
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as FloatType,
} from 'graphql';
import { payment, url } from '../../../config';
import { convert } from '../../../helpers/currencyConvertion';

import stripePackage from 'stripe';
const stripe = stripePackage(payment.stripe.secretKey);
import fetch from 'node-fetch';

import ReservationPaymentType from '../../types/ReservationPaymentType';

import { getCustomerId, getCustomerEmail } from '../../../libs/payment/stripe/helpers/getCustomerId';
import { updateUserProfile } from '../../../libs/payment/stripe/helpers/updateUserProfile';
import { createThread } from '../../../libs/payment/stripe/helpers/createThread';
import { updateReservation } from '../../../libs/payment/stripe/helpers/updateReservation';
import { blockDates } from '../../../libs/payment/stripe/helpers/blockDates';
import { createTransaction } from '../../../libs/payment/stripe/helpers/createTransaction';
import { emailBroadcast } from '../../../libs/payment/stripe/helpers/email';

// Sequelize models
import { Reservation, ListingData, Listing, User, CurrencyRates, Currencies } from '../../models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';
import { isZeroDecimalCurrency } from '../../../helpers/zeroDecimalCurrency';
const createReservation = {

  type: ReservationPaymentType,

  args: {
    listId: { type: new NonNull(IntType) },
    checkIn: { type: new NonNull(StringType) },
    checkOut: { type: new NonNull(StringType) },
    guests: { type: new NonNull(IntType) },
    message: { type: new NonNull(StringType) },
    basePrice: { type: new NonNull(FloatType) },
    cleaningPrice: { type: FloatType },
    currency: { type: new NonNull(StringType) },
    discount: { type: FloatType },
    discountType: { type: StringType },
    guestServiceFee: { type: FloatType },
    hostServiceFee: { type: FloatType },
    total: { type: new NonNull(FloatType) },
    bookingType: { type: StringType },
    paymentType: { type: IntType },
    cardToken: { type: new NonNull(StringType) },
    convCurrency: { type: new NonNull(StringType) },
  },

  async resolve({ request, res }, {
    listId,
    checkIn,
    checkOut,
    guests,
    message,
    basePrice,
    cleaningPrice,
    currency,
    discount,
    discountType,
    guestServiceFee,
    hostServiceFee,
    total,
    bookingType,
    paymentType,
    cardToken,
    convCurrency
  }) {

    try {

      // Check if user already logged in

      if (request.user && !request.user.admin) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        let userId = request.user.id;
        let userBanStatus;
        let isValidTotal = false, reservationId, amount;
        let createCard, createCustomer, source, charge, customerId;
        let status = 200, errorMessage, customerEmail;
        let confirmationCode = Math.floor(100000 + Math.random() * 900000);
        let reservationState, rates, ratesData = {}, hostId, id, reservation, totalWithoutGuestFee = 0;
        let basePriceConverted = 0, totalConverted = 0, totalWithoutGuestFeeConverted = 0, cleaningPriceConverted = 0, discountConverted = 0, guestServiceFeeConverted = 0, hostServiceFeeConverted = 0;
        if (bookingType === 'instant') {
          reservationState = 'approved';
        }



        const userData = await User.findOne({
          attributes: [
            'userBanStatus'
          ],
          where: { id: request.user.id },
          raw: true
        })

        if (userData) {
          if (userData.userBanStatus == 1) {
            return {
              errorMessage: 'You have blocked, Please contact support team.',
              status: 500
            }
          }
          else {
            userBanStatus = false;
          }
        }

        const listData = await Listing.findOne({
          where: {
            id: listId
          },
          raw: true
        });

        hostId = listData.userId;

        const listingData = await ListingData.findOne({
          where: {
            listId
          },
          raw: true
        });

        const data = await CurrencyRates.findAll();
        const base = await Currencies.findOne({ where: { isBaseCurrency: true } });
        if (data) {
          data.map((item) => {
            ratesData[item.dataValues.currencyCode] = item.dataValues.rate;
          })
        }
        rates = ratesData;

        basePriceConverted = convert(base.symbol, rates, basePrice, currency, listingData.currency);
        cleaningPriceConverted = convert(base.symbol, rates, cleaningPrice, currency, listingData.currency);
        discountConverted = convert(base.symbol, rates, discount, currency, listingData.currency);
        guestServiceFeeConverted = convert(base.symbol, rates, guestServiceFee, currency, listingData.currency);
        hostServiceFeeConverted = convert(base.symbol, rates, hostServiceFee, currency, listingData.currency);
        totalConverted = convert(base.symbol, rates, total, currency, listingData.currency);


        let query = `query getBillingCalculation($listId: Int!, $startDate: String!, $endDate: String!, $guests: Int!, $convertCurrency: String!) {
          getBillingCalculation(listId: $listId, startDate: $startDate, endDate: $endDate, guests: $guests, convertCurrency: $convertCurrency) {
            result {
              checkIn
              checkOut
              nights
              basePrice
              cleaningPrice
              guests
              currency
              guestServiceFeePercentage
              hostServiceFeePercentage
              weeklyDiscountPercentage
              monthlyDiscountPercentage
              guestServiceFee
              hostServiceFee
              discountLabel
              discount
              subtotal
              total
            }
            status
            errorMessage
          }
        }
        `;

        let variables = {
          listId,
          startDate: new Date(checkIn),
          endDate: new Date(checkOut),
          guests,
          convertCurrency: currency
        }

        const response = await new Promise((resolve, reject) => {
          fetch(url + '/graphql', {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, variables }),
            method: 'post',
          }).then(res => res.json())
            .then(function (body) {
              if (body) {
                resolve(body)
              } else {
                reject(error)
              }
            });
        });

        if (response && response.data && response.data.getBillingCalculation && response.data.getBillingCalculation.result) {
          if (total === response.data.getBillingCalculation.result.total) {
            isValidTotal = true;
          } else {
            return {
              errorMessage: response.data.getBillingCalculation.errorMessage,
              status: response.data.getBillingCalculation.status
            };
          }
        }

        if (isValidTotal) {

          customerId = await getCustomerId(userId);
          customerEmail = await getCustomerEmail(userId);
          // totalWithoutGuestFee = total - guestServiceFee;
          totalWithoutGuestFeeConverted = totalConverted - guestServiceFeeConverted;
          amount = totalConverted;

          // If customer doesn't exist, create a customer
          if (!customerId && status === 200) {
            try {
              createCustomer = await stripe.customers.create(
                { email: customerEmail }
              );
              if ('id' in createCustomer) {
                customerId = createCustomer.id;
                await updateUserProfile(
                  userId,
                  customerId
                );
              }
            } catch (error) {
              status = 400;
              errorMessage = error.message;
            }
          }

          // if (cardDetails && status === 200) {
          //   try {
          //     createCard = await stripe.tokens.create({
          //       card: cardDetails
          //     });
          //     console.log('createCard', createCard);

          //   } catch (error) {
          //     status = 400;
          //     errorMessage = error.message;
          //   }
          // }

          // // Create source for the customer 
          // if (customerId && createCard && status === 200) {
          //   id = customerId;
          //   console.log('inside', customerId, createCard)
          //   try {
          //     source = await stripe.customers.createSource(id, {
          //       source: createCard.id
          //     });
          //     console.log('source', source);

          //   } catch (error) {
          //     status = 400;
          //     errorMessage = error.message;
          //     console.log('error', error);
          //   }
          // }

          if (customerId && cardToken && status === 200) {
            id = customerId;
            try {
              source = await stripe.customers.createSource(id, {
                source: cardToken
              });

            } catch (error) {
              status = 400;
              errorMessage = error.message;
            }
          }

          // // If there is no error, the  proceed with charging
          if (status === 200) {

            reservation = await Reservation.create({
              listId,
              hostId,
              guestId: userId,
              checkIn,
              checkOut,
              guests,
              message,
              basePrice: basePriceConverted.toFixed(2),
              cleaningPrice: cleaningPriceConverted.toFixed(2),
              currency: listingData.currency,
              discount: discountConverted.toFixed(2),
              discountType,
              guestServiceFee: guestServiceFeeConverted.toFixed(2),
              hostServiceFee: hostServiceFeeConverted.toFixed(2),
              total: totalWithoutGuestFeeConverted.toFixed(2),
              confirmationCode,
              reservationState,
              paymentMethodId: paymentType
            });

            reservationId = reservation.dataValues.id;

            try {


              charge = await stripe.charges.create({
                amount: isZeroDecimalCurrency(listingData.currency) ? Math.round(amount) : Math.round(amount * 100),
                currency: listingData.currency,
                customer: source.customer,
                metadata: {
                  reservationId: reservation.dataValues.id,
                  listId: listId,
                  title: listingData.title
                },
                description: 'Reservation: ' + reservation.dataValues.id
              });
            } catch (error) {
              status = 400;
              errorMessage = error.message;
            }
          }


          if (status === 200 && charge && 'id' in charge) {
            await updateReservation(reservationId);
            await createThread(reservationId);
            await blockDates(reservationId);
            await createTransaction(
              reservationId,
              customerEmail,
              customerId,
              charge.id,
              Math.round(amount),
              listingData.currency,
              'booking',
              2
            );
            try {
              await emailBroadcast(reservationId);
            } catch (err) {
              console.log('err', err);
              return {
                errorMessage: 'Something went wrong ' + err,
                status: 400
              };
            }
            // await emailBroadcast(reservationId);
          }

          return {
            results: reservation,
            status: status,
            errorMessage
          }
        } else {
          return {
            errorMessage: response.data.getBillingCalculation.errorMessage,
            status: response.data.getBillingCalculation.status
          }
        }
      } else {
        return {
          status: 500,
          errorMessage: 'You are not LoggedIn'
        }
      }

    } catch (error) {
      return {
        errorMessage: 'Something went wrong ' + error,
        status: 400
      };
    }
  },
};

export default createReservation;

/**
mutation createReservation($listId: Int!, $checkIn: String!, $checkOut: String!, $guests: Int!, $message: String!, $basePrice: Float!, $cleaningPrice: Float!, $currency: String!, $discount: Float, $discountType: String, $guestServiceFee: Float, $hostServiceFee: Float, $total: Float!, $bookingType: String, $cardToken: String!, $paymentType: Int) {
  createReservation(listId: $listId, checkIn: $checkIn, checkOut: $checkOut, guests: $guests, message: $message, basePrice: $basePrice, cleaningPrice: $cleaningPrice, currency: $currency, discount: $discount, discountType: $discountType, guestServiceFee: $guestServiceFee, hostServiceFee: $hostServiceFee, total: $total, bookingType: $bookingType, cardToken: $cardToken, paymentType: $paymentType) {
    results {
      id
      listId
      hostId
      guestId
      checkIn
      checkOut
      guests
      message
      basePrice
      cleaningPrice
      currency
      discount
      discountType
      guestServiceFee
      hostServiceFee
      total
      confirmationCode
      createdAt
    }
    status
    errorMessage
  }
}
**/
