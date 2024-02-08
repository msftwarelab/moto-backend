
import moment from 'moment';
import {
	GraphQLString as StringType,
	GraphQLInt as IntType,
	GraphQLNonNull as NonNull,
} from 'graphql';
import {
	Reservation,
	Listing,
	Cancellation,
	Threads,
	UserProfile,
	User,
	CurrencyRates,
	Currencies,
	ReservationSpecialPricing,
	ServiceFees
} from '../../models';
import CancellationResponseType from '../../types/CancellationResponseType';
import { convert } from '../../../helpers/currencyConvertion';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const cancelReservationData = {

	type: CancellationResponseType,

	args: {
		reservationId: { type: new NonNull(IntType) },
		userType: { type: new NonNull(StringType) },
		currency: { type: StringType },
	},

	async resolve({ request }, { reservationId, currency, userType }) {
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
				let where, cancellationData, listId, listData, policyData, threadData;
				let reservationState = [{ reservationState: 'pending' }, { reservationState: 'approved' }];

				let checkOutNewDate = new Date();
				checkOutNewDate.setHours(0, 0, 0, 0);
				let checkOut = { $gte: checkOutNewDate };

				let momentStartDate, momentEndDate, days, interval, guestEmail;
				let today = moment().startOf('day');
				let accomodation, guestFees, remainingDays, policyName, firstName, hostEmail, convertedEarnedAmount = 0;
				let checkInDate, checkOutDate, threadId, hostData, guestData, hostName, startedIn, convertedNonRefundableDayPrice = 0;
				let refundableDayPrice = 0, nonRefundableNightPrice = 0, nonRefundableDayPrice = 0, refundWithoutGuestFee = 0, convertPayoutToHost = 0;
				let updatedGuestFee = 0, updatedHostFee = 0, payoutToHost = 0, subtotal = 0, guestName, convertedGuestFee = 0;
				let refundAmount = 0, refundAmountNoGuestFee = 0, refundDays = 0, earnedAmount = 0, earnedDays = 0;
				let convertedRefundAmount = 0, rates, ratesData = {}, convertHostFee = 0, convertedNonRefundAmount = 0;
				let isSameCurrency = true, convertedSubTotal = 0, isSpecialPriceAssigned = false, convertedSpecialPriceAverage = 0;
				let priceForDays = 0, convertedResponse = [], hostRefund = 0, paidAmount = 0;
				const serviceFees = await ServiceFees.findOne({ raw: true });

				const data = await CurrencyRates.findAll({ raw: true });
				const base = await Currencies.findOne({ where: { isBaseCurrency: true } });
				if (data && data.length > 0) {
					data.map((item) => {
						ratesData[item.currencyCode] = item.rate;
					})
				}
				rates = ratesData;

				if (userType === 'owner') {
					where = {
						id,
						hostId: userId,
						$or: reservationState,
						checkOut
					};
				} else {
					where = {
						id,
						guestId: userId,
						$or: reservationState,
						checkOut
					};
				}

				cancellationData = await Reservation.findOne({
					where,
					raw: true
				});

				let deliveryPrice = 0;
				if (cancellationData && cancellationData.delivery) {
					deliveryPrice = cancellationData.delivery;
				} else {
					deliveryPrice = 0;
				}

				const listingSpecialPricingData = await ReservationSpecialPricing.findAll({
					where: {
						reservationId: id
					},
					order: [['blockedDates', 'ASC']],
					raw: true
				});

				let bookingSpecialPricing = [];
				if (listingSpecialPricingData && listingSpecialPricingData.length > 0) {
					Promise.all(listingSpecialPricingData.map((item) => {
						let pricingRow = {}, currentPrice;
						if (item.blockedDates) {
							isSpecialPriceAssigned = true;
							currentPrice = Number(item.isSpecialPrice);
						} else {
							currentPrice = Number(cancellationData.basePrice);
						}
						pricingRow = {
							blockedDates: item.blockedDates,
							isSpecialPrice: currentPrice,
						};
						bookingSpecialPricing.push(pricingRow);
					}));
				} else {
					bookingSpecialPricing = [];
				}

				if (cancellationData) {
					listId = cancellationData.listId

					if (cancellationData.checkIn != null && cancellationData.checkOut != null) {
						momentStartDate = moment(cancellationData.checkIn).startOf('day');
						momentEndDate = moment(cancellationData.checkOut).startOf('day');
						days = cancellationData.dayDifference;
						interval = momentStartDate.diff(today, 'days');
						checkInDate = cancellationData.checkIn != null ? moment(cancellationData.checkIn).format('Do MMM') : '';
						checkOutDate = cancellationData.checkOut != null ? moment(cancellationData.checkOut).format('Do MMM') : '';
					}

					hostEmail = await User.findOne({
						attributes: ['email'],
						where: {
							id: cancellationData.hostId
						},
						raw: true
					});

					guestEmail = await User.findOne({
						attributes: ['email'],
						where: {
							id: cancellationData.guestId
						},
						raw: true
					});

					threadData = await Threads.findOne({
						attributes: ['id'],
						where: {
							listId,
							$and: [{ host: cancellationData.hostId }, { guest: cancellationData.guestId }]
						},
						raw: true
					});

					hostData = await UserProfile.findOne({
						attributes: ['firstName', 'picture', 'createdAt'],
						where: {
							userId: cancellationData.hostId
						},
						raw: true
					});

					guestData = await UserProfile.findOne({
						attributes: ['firstName', 'picture', 'createdAt'],
						where: {
							userId: cancellationData.guestId
						},
						raw: true
					});

					listData = await Listing.findOne({
						attributes: ['title'],
						where: { id: listId },
						attributes: ['id', 'title'],
						raw: true
					});

					policyData = await Cancellation.findOne({
						where: {
							id: cancellationData.cancellationPolicy
						},
						raw: true
					});

					threadId = threadData ? threadData.id : null;
					hostName = hostData ? hostData.firstName : null;
					guestName = guestData ? guestData.firstName : null;

					if (isSpecialPriceAssigned) {
						bookingSpecialPricing && bookingSpecialPricing.length > 0 && bookingSpecialPricing.map((item, index) => {
							priceForDays = Number(priceForDays) + Number(item.isSpecialPrice);
						});
					} else {
						priceForDays = Number(cancellationData.basePrice) * Number(days);
					}

					if (listData && policyData) {
						policyName = policyData.policyName;
						if (interval >= policyData.priorDays) { // Prior
							accomodation = policyData.accommodationPriorCheckIn;
							guestFees = policyData.guestFeePriorCheckIn;
						} else if (interval < policyData.priorDays && interval > 0) { // Before
							accomodation = policyData.accommodationBeforeCheckIn;
							guestFees = policyData.guestFeeBeforeCheckIn;
							remainingDays = days - 1;

						} else { // During
							accomodation = policyData.accommodationDuringCheckIn;
							guestFees = policyData.guestFeeDuringCheckIn;
							remainingDays = (days - 1) + interval;
						}
					}

					startedIn = interval;

					// Calculation 
					if (userType === 'renter') {

						paidAmount = cancellationData.total + cancellationData.guestServiceFee;
						updatedGuestFee = (cancellationData.guestServiceFee * (guestFees / 100));
						subtotal = cancellationData.total + cancellationData.guestServiceFee;

						if (remainingDays >= 0) {
							if (interval <= 0 && remainingDays < days) deliveryPrice = 0;
							refundableDayPrice = (remainingDays * cancellationData.basePrice) * (accomodation / 100);
						} else {
							refundableDayPrice = (priceForDays) * (accomodation / 100);
						}

						refundableDayPrice = refundableDayPrice + deliveryPrice;
						hostRefund = cancellationData.total - refundableDayPrice;
						refundableDayPrice = (refundableDayPrice + updatedGuestFee) - cancellationData.discount;

						//Payout amount calculated with host service fee
						if (hostRefund > 0) {
							if (serviceFees) {
								updatedHostFee = serviceFees.hostType === 'percentage' ? (hostRefund * (Number(serviceFees.hostValue) / 100)) : hostRefund > cancellationData.hostServiceFee ? cancellationData.hostServiceFee : hostRefund;
							}
							payoutToHost = hostRefund - updatedHostFee;
						}

						//Non refundable amount calculated based on the total amount guest paid and the refundable amount with guest service fee
						nonRefundableNightPrice = paidAmount - refundableDayPrice;
						updatedGuestFee = cancellationData.guestServiceFee - updatedGuestFee;
						if (currency != cancellationData.currency) {
							isSameCurrency = false;
							if (updatedHostFee > 0) {
								convertHostFee = convert(base.symbol, rates, updatedHostFee, cancellationData.currency, currency);
							}
							if (refundableDayPrice > 0) {
								convertedRefundAmount = convert(base.symbol, rates, refundableDayPrice, cancellationData.currency, currency);
							}
							if (nonRefundableNightPrice > 0) {
								convertedNonRefundAmount = convert(base.symbol, rates, nonRefundableNightPrice, cancellationData.currency, currency);
							}
							if (updatedGuestFee > 0) {
								convertedGuestFee = convert(base.symbol, rates, updatedGuestFee, cancellationData.currency, currency);
							}
							if (payoutToHost > 0) {
								convertPayoutToHost = convert(base.symbol, rates, payoutToHost, cancellationData.currency, currency);
							}
							if (subtotal > 0) {
								convertedSubTotal = convert(base.symbol, rates, subtotal, cancellationData.currency, currency);
							}

							if (cancellationData && cancellationData.isSpecialPriceAverage > 0) {
								convertedSpecialPriceAverage = convert(base.symbol, rates, cancellationData.isSpecialPriceAverage, cancellationData.currency, currency);
							}
						}


						return await {
							results: {
								reservationId,
								cancellationPolicy: policyName,
								refundToGuest: isSameCurrency ? refundableDayPrice : convertedRefundAmount.toFixed(2),
								nonRefundableDayPrice: isSameCurrency ? nonRefundableNightPrice : convertedNonRefundAmount.toFixed(2),
								payoutToHost: isSameCurrency ? payoutToHost : convertPayoutToHost.toFixed(2),
								guestServiceFee: isSameCurrency ? updatedGuestFee : convertedGuestFee.toFixed(2),
								hostServiceFee: isSameCurrency ? updatedHostFee : convertHostFee.toFixed(2),
								startedIn: startedIn,
								rentingFor: days,
								total: isSameCurrency ? subtotal : convertedSubTotal.toFixed(2),
								listId,
								currency,
								threadId,
								cancelledBy: 'renter',
								checkIn: moment(moment(cancellationData.checkIn)).format('YYYY-MM-DD'),
								checkOut: moment(moment(cancellationData.checkOut)).format('YYYY-MM-DD'),
								startTime: cancellationData.startTime,
								endTime: cancellationData.endTime,
								guests: cancellationData.guests,
								guestName,
								hostName,
								listTitle: listData.title,
								confirmationCode: cancellationData.confirmationCode,
								hostEmail: hostEmail.email,
								guestEmail: guestEmail.email,
								hostProfilePicture: hostData.picture,
								guestProfilePicture: guestData.picture,
								isSpecialPriceAverage: isSameCurrency ? cancellationData.isSpecialPriceAverage : convertedSpecialPriceAverage.toFixed(2),
								guestCreatedAt: guestData.createdAt,
								hostCreatedAt: hostData.createdAt
							},
							status: 200
						};
					} else { // Owner
						let updatedHostFee = cancellationData.hostServiceFee, updatedGuestFee = cancellationData.guestServiceFee, totalEarnings = cancellationData.total - cancellationData.hostServiceFee;
						subtotal = cancellationData.total + cancellationData.guestServiceFee;
						refundDays = days, earnedDays = days;
						//Host Payout amount without subtracting host service fee. total has cleaning Fee with in it.
						if (interval <= 0 && remainingDays < days) {
							refundDays = remainingDays;
							earnedDays = days - remainingDays;
							cancellationData['guestServiceFee'] = 0;
							deliveryPrice = 0;
						}

						refundAmount = (refundDays * cancellationData.basePrice) + deliveryPrice;
						hostRefund = cancellationData.total - refundAmount;

						//Payout amount calculated with host service fee
						if (hostRefund > 0) {
							//New host service fee calculated based on the host refund amount.
							if (serviceFees) {
								updatedHostFee = serviceFees.hostType === 'percentage' ? hostRefund * (Number(serviceFees.hostValue) / 100) : hostRefund > cancellationData.hostServiceFee ? cancellationData.hostServiceFee : hostRefund;
							}
							earnedAmount = hostRefund - updatedHostFee;
							nonRefundableDayPrice = totalEarnings - earnedAmount;

						} else {
							//Payout amount of host is zero
							nonRefundableDayPrice = totalEarnings;
							updatedGuestFee = 0; //Guest fee refunded
							updatedHostFee = 0;
						}

						//Adding guest service fee, if it could be refunded
						refundAmount = (refundAmount + cancellationData.guestServiceFee) - cancellationData.discount;
						if (currency != cancellationData.currency) {
							isSameCurrency = false;
							if (refundAmount > 0) {
								convertedRefundAmount = convert(base.symbol, rates, refundAmount, cancellationData.currency, currency);
							}
							if (nonRefundableDayPrice > 0) {
								convertedNonRefundableDayPrice = convert(base.symbol, rates, nonRefundableDayPrice, cancellationData.currency, currency);
							}
							if (earnedAmount > 0) {
								convertedEarnedAmount = convert(base.symbol, rates, earnedAmount, cancellationData.currency, currency);
							}
							if (updatedHostFee > 0) {
								convertHostFee = convert(base.symbol, rates, updatedHostFee, cancellationData.currency, currency);
							}
							if (subtotal > 0) {
								convertedSubTotal = convert(base.symbol, rates, subtotal, cancellationData.currency, currency);
							}

							if (cancellationData && cancellationData.isSpecialPriceAverage > 0) {
								convertedSpecialPriceAverage = convert(base.symbol, rates, cancellationData.isSpecialPriceAverage, cancellationData.currency, currency);
							}

							if (cancellationData && updatedGuestFee > 0) {
								convertedGuestFee = convert(base.symbol, rates, updatedGuestFee, cancellationData.currency, currency);
							}
						}

						return await {
							results: {
								reservationId,
								cancellationPolicy: policyName,
								refundToGuest: isSameCurrency ? refundAmount : convertedRefundAmount.toFixed(2),
								payoutToHost: isSameCurrency ? earnedAmount : convertedEarnedAmount.toFixed(2),
								nonRefundableDayPrice: isSameCurrency ? nonRefundableDayPrice : convertedNonRefundableDayPrice.toFixed(2),
								guestServiceFee: isSameCurrency ? updatedGuestFee : convertedGuestFee.toFixed(2),
								hostServiceFee: isSameCurrency ? updatedHostFee : convertHostFee.toFixed(2),
								startedIn: startedIn,
								rentingFor: days,
								total: isSameCurrency ? subtotal : convertedSubTotal.toFixed(2),
								listId,
								currency,
								threadId,
								cancelledBy: 'owner',
								checkIn: moment(moment(cancellationData.checkIn)).format('YYYY-MM-DD'),
								checkOut: moment(moment(cancellationData.checkOut)).format('YYYY-MM-DD'),
								startTime: cancellationData.startTime,
								endTime: cancellationData.endTime,
								guests: cancellationData.guests,
								hostName,
								guestName,
								listTitle: listData.title,
								confirmationCode: cancellationData.confirmationCode,
								hostEmail: hostEmail.email,
								guestEmail: guestEmail.email,
								guestProfilePicture: guestData.picture,
								hostProfilePicture: hostData.picture,
								guestCreatedAt: guestData.createdAt,
								hostCreatedAt: hostData.createdAt,
								isSpecialPriceAverage: isSameCurrency ? cancellationData.isSpecialPriceAverage : convertedSpecialPriceAverage.toFixed(2),
							},
							status: 200
						}
					}
				} else {
					return await {
						status: 400,
						errorMessage: "Oops! Something went wrong, please contact support."
					}
				}
			} else {
				return {
					status: 500,
					errorMessage: 'Oops! please login with your account and try again!',
				};
			}
		} catch (error) {
			return {
				errorMessage: 'Something went wrong! ' + error,
				status: 400
			}
		}
	}
};

export default cancelReservationData;

