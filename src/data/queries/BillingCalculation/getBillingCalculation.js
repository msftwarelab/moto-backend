import BillingType from '../../types/BillingType';

import { ListBlockedDates, ListingData, ServiceFees, CurrencyRates, Currencies } from '../../../data/models';

import moment from 'moment';

import { convert } from '../../../helpers/currencyConvertion';

import {
	GraphQLString as StringType,
	GraphQLInt as IntType,
	GraphQLNonNull as NonNull,
	GraphQLFloat as FloatType,
	GraphQLBoolean as BooleanType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getBillingCalculation = {

	type: BillingType,

	args: {
		listId: { type: new NonNull(IntType) },
		startDate: { type: new NonNull(StringType) },
		endDate: { type: new NonNull(StringType) },
		guests: { type: new NonNull(IntType) },
		convertCurrency: { type: new NonNull(StringType) },
		startTime: { type: FloatType },
		endTime: { type: FloatType },
		isDeliveryIncluded: { type: BooleanType },
	},

	async resolve({ request }, { listId, startDate, endDate, guests, convertCurrency, startTime, endTime, isDeliveryIncluded }) {

		let momentStartDate, momentEndDate, dayDifference, priceForDays = 0, discount, discountType, total, serviceFee;
		let hostServiceFee, guestServiceFee, weeklyDiscountPercentage = 0, monthlyDiscountPercentage = 0;
		let subtotal = 0, rates, ratesData = {}, convertedAmount = 0, convertedPriceForDays = 0, isMaxDay = false;
		let convertGuestServiceFee = 0, convertDeliveryPrice = 0, convertDiscount = 0, convertHostFee = 0, isMinDay = false;
		let result = [], guestErrorMessage, convertedMonthlyDiscountPercentage = 0, convertedWeeklyDiscountPercentage = 0;
		let bookingSpecialPricing = [], convertedAveragePrice = 0, securityDeposit = 0;
		let stayedNights = [], currentDay, isSpecialPriceAssigned = false, breakPoint;
		let isAverage = 0, isDayTotal = 0, noticeTimeValue, totalWithoutServiceFee = 0;
		let deliveryFee = 0;

		if (request && request.user) {
			const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
			if (userStatusErrorMessage) {
				return {
					status: userStatusError,
					errorMessage: userStatusErrorMessage
				};
			}
		}

		const listingData = await ListingData.findOne({
			where: {
				listId
			},
			raw: true
		});

		momentStartDate = new Date(startDate);
		momentEndDate = new Date(endDate);
		dayDifference = moment(moment(momentEndDate)).diff(moment(moment(momentStartDate)), 'days');
		dayDifference = dayDifference + 1;

		if (listingData) {
			if (listingData.maxDay && listingData.maxDay > 0) {
				if (dayDifference > listingData.maxDay) {
					isMaxDay = true;
				}
			}

			if (listingData.minDay && listingData.minDay > 0) {
				if (dayDifference < listingData.minDay) {
					isMinDay = true;
				}
			}
			noticeTimeValue = listingData.maxDaysNotice
		} else {
			return {
				errorMessage: 'Please enter a valid list id. ',
				status: 400
			}
		}

		try {

			if (noticeTimeValue) {
				let noticeErrorMessage, formattedCheckout, formattedBreakPoint;
				formattedCheckout = new Date(endDate);
				if (noticeTimeValue == 'unavailable') {
					noticeErrorMessage = 'Those dates are not available';
				} else if (noticeTimeValue == '3months') {
					breakPoint = moment().add(3, 'months');
					noticeErrorMessage = 'maximum allowed dates 3 months'
				} else if (noticeTimeValue == '6months') {
					breakPoint = moment().add(6, 'months');
					noticeErrorMessage = 'maximum allowed dates 6 months'
				} else if (noticeTimeValue == '9months') {
					breakPoint = moment().add(9, 'months');
					noticeErrorMessage = 'maximum allowed dates 9 months'
				} else if (noticeTimeValue == '12months') {
					breakPoint = moment().add(12, 'months');
					noticeErrorMessage = 'maximum allowed dates 12 months'
				}

				formattedBreakPoint = new Date(breakPoint);

				if (formattedCheckout > formattedBreakPoint) {
					return {
						status: 400,
						errorMessage: noticeErrorMessage
					}
				}

			}

			if (isMaxDay || isMinDay) {
				if (listingData) {
					if (isMaxDay) {
						return {
							status: 400,
							errorMessage: 'Maximum allowed days is ' + listingData.maxDay
						}
					} else {
						return {
							status: 400,
							errorMessage: 'Minimum allowed days is ' + listingData.minDay
						}
					}
				} else {
					return {
						errorMessage: 'Please enter a valid list id.',
						status: 400
					}
				}
			} else {

				let convertStartDate = new Date(startDate);
				convertStartDate.setHours(0, 0, 0, 0);
				let convertEndDate = new Date(endDate);
				convertEndDate.setHours(23, 59, 59, 999);

				const checkAvailableDates = await ListBlockedDates.findAll({
					where: {
						listId,
						blockedDates: {
							$between: [convertStartDate, convertEndDate]
						}
					},
					raw: true
				});

				const specialPricingData = await ListBlockedDates.findAll({
					where: {
						listId,
						blockedDates: {
							$between: [convertStartDate, convertEndDate]
						},
						calendarStatus: 'available'
					},
					order: [['blockedDates', 'ASC']],
					raw: true
				});

				let isBlocked = checkAvailableDates && checkAvailableDates.length > 0 ? checkAvailableDates.filter(o => o.calendarStatus == "blocked") : [];

				// Get Service fee Settings
				const serviceFees = await ServiceFees.findOne();

				// Get List data for Listings
				if (isBlocked && isBlocked.length > 0) {
					return {
						status: 400,
						errorMessage: 'Those dates are not available.'
					}
				} else {
					const data = await CurrencyRates.findAll({
						raw: true
					});
					const base = await Currencies.findOne({ where: { isBaseCurrency: true }, raw: true });
					if (data) {
						data.map((item) => {
							ratesData[item.currencyCode] = item.rate;
						})
					}
					rates = ratesData;

					if (listingData) {
						if (startDate != null && endDate != null) {
							momentStartDate = new Date(startDate);
							momentEndDate = new Date(endDate);
							dayDifference = moment(moment(momentEndDate)).diff(moment(moment(momentStartDate)), 'days');
							dayDifference = dayDifference + 1;

							weeklyDiscountPercentage = listingData.weeklyDiscount > 0 ? listingData.weeklyDiscount : 0;
							monthlyDiscountPercentage = listingData.monthlyDiscount > 0 ? listingData.monthlyDiscount : 0;

							if (dayDifference > 0) {

								// Find stayed nights
								for (let i = 0; i < dayDifference; i++) {
									let currentDate = moment(moment(startDate)).add(i, 'day');
									stayedNights.push(currentDate);
								}

								if (stayedNights && stayedNights.length > 0) {
									stayedNights.map((item) => {
										let isSpecialPricing;
										if (item) {
											let pricingRow, currentPrice;
											currentDay = (moment(item).format('dddd').toLowerCase());
											if (specialPricingData && specialPricingData.length > 0) {
												isSpecialPricing = specialPricingData.find(o => moment(item).format('MM/DD/YYYY') == moment(o.blockedDates).format('MM/DD/YYYY'));
											}

											if (isSpecialPricing && isSpecialPricing.isSpecialPrice) {
												isSpecialPriceAssigned = true;
												currentPrice = Number(isSpecialPricing.isSpecialPrice);
											} else {
												currentPrice = Number(listingData.basePrice);
											}

											// // Price object
											pricingRow = {
												blockedDates: item,
												isSpecialPrice: currentPrice,
											};

											bookingSpecialPricing.push(pricingRow);
										}
									});
								}
							}

							if (isSpecialPriceAssigned) {
								bookingSpecialPricing.map((item, index) => {
									priceForDays = priceForDays + Number(item.isSpecialPrice);
								});
							} else {
								bookingSpecialPricing.map((item, index) => {
									priceForDays = priceForDays + Number(item.isSpecialPrice);
								});
							}
							discount = 0;
							discountType = null;
							total = 0;
							securityDeposit = listingData.securityDeposit;
						}

						isAverage = Number(priceForDays) / Number(dayDifference);
						isDayTotal = isAverage.toFixed(2) * dayDifference;
						priceForDays = isDayTotal;
						deliveryFee = isDeliveryIncluded ? listingData.delivery : 0

						if (dayDifference >= 7) {
							if (monthlyDiscountPercentage > 0 && dayDifference >= 28) {
								discount = (Number(priceForDays) * Number(monthlyDiscountPercentage)) / 100;
								discountType = monthlyDiscountPercentage + "% " + "monthly price discount";
							} else {
								discount = (Number(priceForDays) * Number(weeklyDiscountPercentage)) / 100;
								discountType = weeklyDiscountPercentage + "% " + "weekly price discount";
							}
						}

						totalWithoutServiceFee = (isDayTotal + deliveryFee) - discount
						if (serviceFees) {
							if (serviceFees.guestType === 'percentage') {
								guestServiceFee = totalWithoutServiceFee * (Number(serviceFees.guestValue) / 100);
							} else {
								guestServiceFee = convert(base.symbol, rates, serviceFees.guestValue, serviceFees.currency, convertCurrency);
							}

							if (serviceFees.hostType === 'percentage') {
								hostServiceFee = totalWithoutServiceFee * (Number(serviceFees.hostValue) / 100);
							} else {
								hostServiceFee = convert(base.symbol, rates, serviceFees.hostValue, serviceFees.currency, convertCurrency);
							}
						}

						if (guestServiceFee > 0 && serviceFees.guestType === 'percentage') {
							convertGuestServiceFee = convert(base.symbol, rates, guestServiceFee, listingData.currency, convertCurrency);
						}
						if (guestServiceFee > 0 && serviceFees.guestType === 'fixed') {
							convertGuestServiceFee = guestServiceFee;
						}

						if (listingData && listingData.delivery > 0) {
							convertDeliveryPrice = convert(base.symbol, rates, listingData.delivery, listingData.currency, convertCurrency);
						}

						if (discount > 0) {
							convertDiscount = convert(base.symbol, rates, discount, listingData.currency, convertCurrency);
						}

						if (hostServiceFee > 0 && serviceFees.hostType === 'percentage') {
							convertHostFee = convert(base.symbol, rates, hostServiceFee, listingData.currency, convertCurrency);
						}
						if (hostServiceFee > 0 && serviceFees.hostType === 'fixed') {
							convertHostFee = hostServiceFee;
						}

						if (listingData.basePrice > 0) {
							convertedAmount = convert(base.symbol, rates, listingData.basePrice, listingData.currency, convertCurrency);
						}

						if (listingData.currency != convertCurrency) {
							if (priceForDays > 0) {
								convertedPriceForDays = convert(base.symbol, rates, priceForDays, listingData.currency, convertCurrency);
							}
						} else {
							if (priceForDays > 0) {
								convertedPriceForDays = priceForDays;
							}
						}

						if (monthlyDiscountPercentage > 0) {
							convertedMonthlyDiscountPercentage = convert(base.symbol, rates, monthlyDiscountPercentage, listingData.currency, convertCurrency);
						}

						if (weeklyDiscountPercentage > 0) {
							convertedWeeklyDiscountPercentage = convert(base.symbol, rates, weeklyDiscountPercentage, listingData.currency, convertCurrency);
						}

						if (guestServiceFee > 0 && serviceFees.guestType === 'percentage') {
							convertGuestServiceFee = convert(base.symbol, rates, guestServiceFee, listingData.currency, convertCurrency);
						}
						if (guestServiceFee > 0 && serviceFees.guestType === 'fixed') {
							convertGuestServiceFee = guestServiceFee;
						}

						if (listingData && listingData.delivery > 0) {
							convertDeliveryPrice = convert(base.symbol, rates, listingData.delivery, listingData.currency, convertCurrency);
						}

						if (discount > 0) {
							convertDiscount = convert(base.symbol, rates, discount, listingData.currency, convertCurrency);
						}

						if (hostServiceFee > 0 && serviceFees.hostType === 'percentage') {
							convertHostFee = convert(base.symbol, rates, hostServiceFee, listingData.currency, convertCurrency);
						}
						if (hostServiceFee > 0 && serviceFees.hostType === 'fixed') {
							convertHostFee = hostServiceFee;
						}

						if (isAverage > 0) {
							convertedAveragePrice = convert(base.symbol, rates, isAverage, listingData.currency, convertCurrency);
						}

						if (securityDeposit) {
							securityDeposit = convert(base.symbol, rates, securityDeposit, listingData.currency, convertCurrency)
						}

						convertHostFee = hostServiceFee;
						let deliveryTotal = isDeliveryIncluded ? convertDeliveryPrice : 0;
						total = (convertedPriceForDays + convertGuestServiceFee + deliveryTotal) - convertDiscount + securityDeposit;
						subtotal = (convertedPriceForDays + deliveryTotal) - convertDiscount + securityDeposit;
					}

					// listing data
					return {
						result: {
							checkIn: moment(moment(startDate)).format('YYYY-MM-DD'),
							checkOut: moment(moment(endDate)).format('YYYY-MM-DD'),
							startTime,
							endTime,
							days: dayDifference,
							basePrice: convertedAmount.toFixed(2),
							delivery: convertDeliveryPrice.toFixed(2),
							guests: guests > 0 ? guests : guestErrorMessage,
							currency: convertCurrency,
							guestServiceFeePercentage: serviceFees.guestValue,
							hostServiceFeePercentage: serviceFees.hostValue,
							weeklyDiscountPercentage: convertedWeeklyDiscountPercentage,
							monthlyDiscountPercentage: convertedMonthlyDiscountPercentage,
							guestServiceFee: convertGuestServiceFee.toFixed(2),
							hostServiceFee: convertHostFee.toFixed(2),
							discountLabel: discountType,
							discount: convertDiscount.toFixed(2),
							subtotal: subtotal.toFixed(2),
							total: total.toFixed(2),
							availableStatus: "Available",
							averagePrice: convertedAveragePrice.toFixed(2),
							priceForDays: convertedPriceForDays.toFixed(2),
							specialPricing: bookingSpecialPricing,
							isSpecialPriceAssigned: isSpecialPriceAssigned,
							securityDeposit: securityDeposit.toFixed(2)
						},
						status: 200
					};

				}
			}
		} catch (error) {
			return {
				errorMessage: 'Something went wrong! ' + error,
				status: 400
			}
		}
	},
};

export default getBillingCalculation;

/*

query getBillingCalculation($listId: Int!, $startDate: String!, $endDate: String!, $guests: Int!, $convertCurrency: String!, $startTime: Float, $endTime: Float) {
	getBillingCalculation(listId: $listId, startDate: $startDate, endDate: $endDate, guests: $guests, convertCurrency: $convertCurrency, startTime: $startTime, endTime: $endTime) {
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
				specialPricing
				isSpecialPriceAssigned
		}
	}
}


*/