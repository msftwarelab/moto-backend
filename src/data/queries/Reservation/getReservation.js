import ReservationCommonTypes from '../../types/ReservationCommonType';
import { Reservation, ListBlockedDates, ListingData, ServiceFees, CurrencyRates, Currencies, CancellationDetails, TransactionHistory } from '../../models';
import { convert } from '../../../helpers/currencyConvertion';
import moment from 'moment';
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLFloat as FloatType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getReservation = {

  type: ReservationCommonTypes,

  args: {
    reservationId: { type: new NonNull(IntType) },
    convertCurrency: { type: StringType }
  },

  async resolve({ request, response }, { reservationId, convertCurrency }) {
    try {
      if (request.user) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        const id = reservationId;
        const userId = request.user.id;
        let where;
        where = {
          id,
          $or: [
            {
              hostId: userId
            },
            {
              guestId: userId
            }
          ]
        };
        const getReservationData = await Reservation.findOne({
          where,
          raw: true
        });

        if (getReservationData) {
          let convertedBasePrice, convertedIsSpecialAverage, convertedTotalDaysAmount, convertedGuestServicefee;
          let convertedHostServiceFee, convertTotalWithGuestServiceFee, convertedDeliveryPrice, convertedDiscount;
          let totalDaysAmount, momentStartDate, momentEndDate, totalWithGuestServiceFee, totalDays = 0;
          let rates, ratesData = {}, convertedClaimRefund = 0, convertedClaimAmount = 0, convertedClaimPayout = 0;
          let convertedTotalWithHostServiceFee = 0, totalWithHostServiceFee = 0, deliveryFee = 0, convertedSecurityDeposit = getReservationData.securityDeposit, actualEarnings = 0, convertedClaimPaidAmount = 0;

          const data = await CurrencyRates.findAll();
          const base = await Currencies.findOne({ where: { isBaseCurrency: true } });
          data && data.map((item) => {
            ratesData[item.dataValues.currencyCode] = item.dataValues.rate;
          })
          rates = ratesData;

          const claimPaidData = await TransactionHistory.findOne({
            attributes: ['amount', 'currency'],
            where: {
              reservationId: getReservationData.id,
              payoutType: 'claimPayout'
            },
            raw: true
          });


          if (getReservationData.checkIn && getReservationData.checkOut) {
            momentStartDate = moment(getReservationData.checkIn);
            momentEndDate = moment(getReservationData.checkOut);
            //totalDays = momentEndDate.diff(momentStartDate, 'days') + 1;
            totalDays = getReservationData.dayDifference;
          }

          if (claimPaidData && claimPaidData.amount && claimPaidData.currency) {
            convertedClaimPaidAmount = convertCurrency && convertCurrency != claimPaidData.currency ? convert(base.symbol, rates, claimPaidData.amount, claimPaidData.currency, convertCurrency) : convertedClaimPaidAmount;
          }

          totalWithGuestServiceFee = getReservationData.total || getReservationData.guestServiceFee ? getReservationData.total + getReservationData.guestServiceFee : 0;

          totalDaysAmount = getReservationData.isSpecialPriceAverage && getReservationData.isSpecialPriceAverage > 0 ? getReservationData.isSpecialPriceAverage * totalDays : getReservationData.basePrice * totalDays;
          totalWithHostServiceFee = (getReservationData.total || getReservationData.hostServiceFee) ? getReservationData.total - getReservationData.hostServiceFee : 0;
          convertedBasePrice = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.basePrice, getReservationData.currency, convertCurrency) : getReservationData.basePrice;

          if (getReservationData.isSpecialPriceAverage) {
            convertedIsSpecialAverage = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.isSpecialPriceAverage, getReservationData.currency, convertCurrency) : getReservationData.isSpecialPriceAverage;
          }

          deliveryFee = getReservationData && getReservationData.delivery ? getReservationData.delivery : 0
          convertedTotalDaysAmount = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, totalDaysAmount, getReservationData.currency, convertCurrency) : totalDaysAmount;

          convertedGuestServicefee = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.guestServiceFee, getReservationData.currency, convertCurrency) : getReservationData.guestServiceFee;

          convertedHostServiceFee = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.hostServiceFee, getReservationData.currency, convertCurrency) : getReservationData.hostServiceFee;

          convertTotalWithGuestServiceFee = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, totalWithGuestServiceFee, getReservationData.currency, convertCurrency) : totalWithGuestServiceFee;

          convertedDeliveryPrice = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, deliveryFee, getReservationData.currency, convertCurrency) : getReservationData.delivery;

          convertedDiscount = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.discount, getReservationData.currency, convertCurrency) : getReservationData.discount;

          convertedTotalWithHostServiceFee = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, totalWithHostServiceFee, getReservationData.currency, convertCurrency) : totalWithHostServiceFee;

          convertedSecurityDeposit = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.securityDeposit, getReservationData.currency, convertCurrency) : convertedSecurityDeposit;

          convertedClaimPayout = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.claimPayout, getReservationData.currency, convertCurrency) : getReservationData.claimPayout;

          convertedClaimRefund = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.claimRefund, getReservationData.currency, convertCurrency) : getReservationData.claimRefund;

          convertedClaimAmount = convertCurrency && convertCurrency != getReservationData.currency ? convert(base.symbol, rates, getReservationData.claimAmount, getReservationData.currency, convertCurrency) : getReservationData.claimAmount;

          if (getReservationData.reservationState == 'cancelled') {
            const cancelData = await CancellationDetails.findOne({
              attributes: ['payoutToHost', 'currency'],
              where: {
                reservationId
              },
              raw: true
            });
            if (cancelData && cancelData.payoutToHost && cancelData.payoutToHost > 0)
              actualEarnings = convertCurrency && convertCurrency != cancelData.currency ? convert(base.symbol, rates, cancelData.payoutToHost, cancelData.currency, convertCurrency) : cancelData.payoutToHost;
          }

          return {
            status: 200,
            results: getReservationData,
            convertedBasePrice: convertedBasePrice ? convertedBasePrice.toFixed(2) : 0,
            convertedIsSpecialAverage: convertedIsSpecialAverage ? convertedIsSpecialAverage.toFixed(2) : 0,
            convertedTotalDaysAmount: convertedTotalDaysAmount ? convertedTotalDaysAmount.toFixed(2) : 0,
            convertedGuestServicefee: convertedGuestServicefee ? convertedGuestServicefee.toFixed(2) : 0,
            convertedHostServiceFee: convertedHostServiceFee ? convertedHostServiceFee.toFixed(2) : 0,
            convertTotalWithGuestServiceFee: convertTotalWithGuestServiceFee ? convertTotalWithGuestServiceFee.toFixed(2) : 0,
            convertedDeliveryPrice: convertedDeliveryPrice ? convertedDeliveryPrice.toFixed(2) : 0,
            convertedDiscount: convertedDiscount ? convertedDiscount.toFixed(2) : 0,
            convertedTotalWithHostServiceFee: convertedTotalWithHostServiceFee > 0 ? convertedTotalWithHostServiceFee.toFixed(2) : 0,
            convertedSecurityDeposit: convertedSecurityDeposit ? convertedSecurityDeposit.toFixed(2) : 0,
            convertedClaimPayout: convertedClaimPayout ? convertedClaimPayout.toFixed(2) : 0,
            convertedClaimRefund: convertedClaimRefund ? convertedClaimRefund.toFixed(2) : 0,
            convertedClaimAmount: convertedClaimAmount ? convertedClaimAmount.toFixed(2) : 0,
            actualEarnings: actualEarnings > 0 ? actualEarnings.toFixed(2) : 0,
            convertedClaimPaidAmount: convertedClaimPaidAmount > 0 ? convertedClaimPaidAmount.toFixed(2) : 0
          };
        } else {
          return {
            status: 400,
            errorMessage: 'Sorry, You have provided invalid reservation Id for this User.'
          };
        }
      } else {
        return {
          status: 500,
          errorMessage: 'Oops! Please login with your account and try again.',
        };
      }
    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  }
}

export default getReservation;