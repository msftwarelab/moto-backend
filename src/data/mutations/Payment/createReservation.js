// GrpahQL
import {
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as FloatType,
  GraphQLBoolean as BooleanType
} from 'graphql';
import fetch from 'node-fetch';
import { Reservation, ListingData, Listing, User, CurrencyRates, Currencies, ReservationSpecialPricing } from '../../models';
import ReservationPaymentType from '../../types/ReservationPaymentType';

import { url } from '../../../config';
import { convert } from '../../../helpers/currencyConvertion';
import { createCustomer, createStripePayment } from '../../../libs/payment/stripe/helpers/stripe';
import { createPayPalPayment } from '../../../libs/payment/paypal/createPayPalPayment';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';


const createReservation = {

  type: ReservationPaymentType,

  args: {
    listId: { type: new NonNull(IntType) },
    checkIn: { type: new NonNull(StringType) },
    checkOut: { type: new NonNull(StringType) },
    guests: { type: new NonNull(IntType) },
    message: { type: new NonNull(StringType) },
    basePrice: { type: new NonNull(FloatType) },
    delivery: { type: FloatType },
    currency: { type: new NonNull(StringType) },
    discount: { type: FloatType },
    discountType: { type: StringType },
    guestServiceFee: { type: FloatType },
    hostServiceFee: { type: FloatType },
    total: { type: new NonNull(FloatType) },
    bookingType: { type: StringType },
    paymentType: { type: IntType },
    cardToken: { type: StringType },
    averagePrice: { type: FloatType },
    days: { type: IntType },
    startTime: { type: FloatType },
    endTime: { type: FloatType },
    licenseNumber: { type: new NonNull(StringType) },
    firstName: { type: new NonNull(StringType) },
    middleName: { type: StringType },
    lastName: { type: new NonNull(StringType) },
    dateOfBirth: { type: new NonNull(StringType) },
    countryCode: { type: StringType },
    isDeliveryIncluded: { type: BooleanType },
    paymentCurrency: { type: StringType },
  },

  async resolve({ request, res }, {
    listId,
    checkIn,
    checkOut,
    guests,
    message,
    basePrice,
    delivery,
    currency,
    discount,
    discountType,
    guestServiceFee,
    hostServiceFee,
    total,
    bookingType,
    paymentType,
    cardToken,
    averagePrice,
    days,
    startTime,
    endTime,
    licenseNumber,
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    countryCode,
    isDeliveryIncluded,
    paymentCurrency
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
        let isValidTotal = false, reservationId, amount;
        let status = 200, errorMessage;
        let confirmationCode = Math.floor(100000 + Math.random() * 900000);
        let reservationState, rates, ratesData = {}, hostId, id, reservation, totalWithoutGuestFee = 0;
        let basePriceConverted = 0, totalConverted = 0, totalWithoutGuestFeeConverted = 0;
        let discountConverted = 0, guestServiceFeeConverted = 0, hostServiceFeeConverted = 0;
        let convertSpecialPricing = [], averagePriceConverted = 0, specialPriceCollection = [];
        let listingBaseprice = 0, listingDeliveryPrice = 0, securityDeposit = 0, paymentIntentId;
        let isSpecialPriceAssigned = false;
        let customerId, customerEmail, paymentIntentSecret, requireAdditionalAction = false, redirectUrl;

        if (bookingType === 'instant') {
          reservationState = 'approved';
        }

        const userData = await User.findOne({
          attributes: [
            'userBanStatus'
          ],
          where: { id: request.user.id },
          raw: true
        });

        if (userData && userData.userBanStatus == 1) {
          return await {
            errorMessage: 'Sorry, It looks like your account is blocked, Please contact our support team and they will assist you!',
            status: 500
          }
        }

        const listData = await Listing.findOne({
          attributes: ['userId', 'title'],
          where: {
            id: listId
          },
          raw: true
        });

        hostId = listData.userId;

        const listingData = await ListingData.findOne({
          attributes: ['basePrice', 'currency', 'cancellationPolicy', 'delivery', 'securityDeposit'],
          where: {
            listId
          },
          raw: true
        });

        const data = await CurrencyRates.findAll({
          raw: true
        });
        const base = await Currencies.findOne({ where: { isBaseCurrency: true }, raw: true });

        if (data && data.length > 0) {
          data.map((item) => {
            ratesData[item.currencyCode] = item.rate;
          })
        }
        rates = ratesData;

        if (listingData) {
          listingBaseprice = listingData.basePrice;
          listingDeliveryPrice = isDeliveryIncluded ? listingData.delivery : 0;
          securityDeposit = listingData.securityDeposit;
        }

        basePriceConverted = convert(base.symbol, rates, basePrice, currency, listingData.currency);
        discountConverted = convert(base.symbol, rates, discount, currency, listingData.currency);
        guestServiceFeeConverted = convert(base.symbol, rates, guestServiceFee, currency, listingData.currency);
        hostServiceFeeConverted = convert(base.symbol, rates, hostServiceFee, currency, listingData.currency);
        totalConverted = convert(base.symbol, rates, total, currency, listingData.currency);

        if (currency != listingData.currency) {
          averagePriceConverted = convert(base.symbol, rates, averagePrice, currency, listingData.currency);
        } else {
          averagePriceConverted = averagePrice;
        }

        let query = `query getBillingCalculation($listId: Int!, $startDate: String!, $endDate: String!, $guests: Int!, $convertCurrency: String!, $startTime: Float, $endTime: Float, $isDeliveryIncluded: Boolean) {
          getBillingCalculation(listId: $listId, startDate: $startDate, endDate: $endDate, guests: $guests, convertCurrency: $convertCurrency, startTime: $startTime, endTime: $endTime, isDeliveryIncluded: $isDeliveryIncluded) {
            status
            errorMessage
            result {
                checkIn
                checkOut
                startTime
                endTime
                days
                basePrice
                delivery
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
                availableStatus
                averagePrice
                priceForDays
                specialPricing {
                  blockedDates
                  isSpecialPrice
                }
                isSpecialPriceAssigned
                securityDeposit
            }
          }
        }
      `;

        let variables = {
          listId,
          startDate: new Date(checkIn),
          endDate: new Date(checkOut),
          guests,
          convertCurrency: currency,
          startTime,
          endTime,
          isDeliveryIncluded
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
          isSpecialPriceAssigned = response.data.getBillingCalculation.result.isSpecialPriceAssigned;
          if (isSpecialPriceAssigned) {
            convertSpecialPricing = response.data.getBillingCalculation.result.specialPricing;
          }
          if (total === response.data.getBillingCalculation.result.total) {
            isValidTotal = true;
          } else {
            return {
              errorMessage: 'Oops! It looks like something went wrong with your trip billing! Please try again.',
              status: 400
            };
          }
        }

        if (isValidTotal) {

          totalWithoutGuestFeeConverted = totalConverted - guestServiceFeeConverted - securityDeposit;
          amount = totalConverted;
          if (paymentType === 2 && status === 200) {
            //  create customer in stripe
            const stripeCustomerData = await createCustomer(userId);
            status = stripeCustomerData.status;
            errorMessage = stripeCustomerData.errorMessage;
            customerId = stripeCustomerData.customerId;
            customerEmail = stripeCustomerData.customerEmail;
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
              basePrice: listingBaseprice,
              delivery: listingDeliveryPrice,
              currency: listingData.currency,
              discount: discountConverted.toFixed(2),
              discountType,
              guestServiceFee: guestServiceFeeConverted.toFixed(2),
              hostServiceFee: hostServiceFeeConverted.toFixed(2),
              total: totalWithoutGuestFeeConverted.toFixed(2),
              confirmationCode,
              reservationState,
              paymentMethodId: paymentType,
              cancellationPolicy: listingData && listingData.cancellationPolicy,
              isSpecialPriceAverage: averagePriceConverted.toFixed(2),
              dayDifference: days,
              startTime,
              endTime,
              licenseNumber,
              firstName,
              middleName,
              lastName,
              dateOfBirth,
              countryCode,
              securityDeposit,
              listTitle: listData.title
            });

            reservationId = reservation.dataValues.id;


            if (reservation && isSpecialPriceAssigned) {
              if (convertSpecialPricing && convertSpecialPricing.length > 0) {
                await Promise.all(convertSpecialPricing.map(async (item, key) => {
                  let convertDate = new Date(parseInt(item.blockedDates));

                  let blockedDatesInstance = {
                    listId,
                    reservationId: reservationId,
                    blockedDates: convertDate,
                    isSpecialPrice: item.isSpecialPrice
                  };

                  specialPriceCollection.push(blockedDatesInstance);
                }));

                // Do the bulk insert for the special pricing dates
                const bulkCreate = await ReservationSpecialPricing.bulkCreate(specialPriceCollection);
              }
            }

            if (paymentType === 2) {
              //  Create stripe paymentIntents
              const stripePaymentData = await createStripePayment(cardToken, amount, listingData.currency, customerId, customerEmail, reservationId, listId, listData.title);
              status = stripePaymentData.status;
              errorMessage = stripePaymentData.errorMessage;
              requireAdditionalAction = stripePaymentData.requireAdditionalAction;
              paymentIntentSecret = stripePaymentData.paymentIntentSecret;
            } else {
              //  Create paypal payment
              await createPayPalPayment(listData.title, reservationId, amount, paymentCurrency)
                .then(res => {
                  if (res.payer.payment_method === 'paypal') {
                    for (var i = 0; i < res.links.length; i++) {
                      var link = res.links[i];
                      if (link.method === 'REDIRECT') {
                        redirectUrl = link.href;
                      }
                    }
                    status = 200;
                  }
                })
                .catch((err) => {
                  status = 400;
                  errorMessage = 'Something went wrong ' + err;
                });
            }


          }

          return await {
            results: reservation,
            status,
            errorMessage,
            requireAdditionalAction,
            paymentIntentSecret,
            paymentIntentId,
            reservationId,
            redirectUrl
          }
        } else {
          return await {
            errorMessage: response.data.getBillingCalculation.errorMessage,
            status: response.data.getBillingCalculation.status
          }
        }
      } else {
        return {
          status: 500,
          errorMessage: 'Please login with your account and continue to your booking!'
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

mutation createReservation($listId: Int!, $checkIn: String!, $checkOut: String!, $guests: Int!, $message: String!, $basePrice: Float!, $delivery: Float!, $currency: String!, $discount: Float, $discountType: String, $guestServiceFee: Float, $hostServiceFee: Float, $total: Float!, $bookingType: String, $cardToken: String!, $paymentType: Int, $averagePrice: Float, $days: Int, $startTime: Float, $endTime: Float, $licenseNumber: String!, $firstName: String!, $middleName: String, $lastName: String!, $dateOfBirth: String!, $countryCode: String) {
  createReservation(listId: $listId, checkIn: $checkIn, checkOut: $checkOut, guests: $guests, message: $message, basePrice: $basePrice, delivery: $delivery, currency: $currency, discount: $discount, discountType: $discountType, guestServiceFee: $guestServiceFee, hostServiceFee: $hostServiceFee, total: $total, bookingType: $bookingType, cardToken: $cardToken, paymentType: $paymentType, averagePrice: $averagePrice, days: $days, startTime: $startTime, endTime: $endTime, licenseNumber: $licenseNumber, firstName: $firstName, middleName: $middleName, lastName: $lastName, dateOfBirth: $dateOfBirth, countryCode: $countryCode) {
    results {
      id
      listId
      hostId
      guestId
      checkIn
      checkOut
      startTime
      endTime	
      guests
      message
      basePrice
      delivery
      currency
      discount
      discountType
      guestServiceFee
      hostServiceFee
      total
      confirmationCode
      createdAt
      reservationState
      paymentState
    }
    status
    errorMessage
  }
}

**/
