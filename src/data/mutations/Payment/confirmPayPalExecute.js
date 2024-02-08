// GrpahQL
import {
	GraphQLString as StringType,
	GraphQLNonNull as NonNull
} from 'graphql';

import ReservationPaymentType from '../../types/ReservationPaymentType';
import { createThread } from '../../../libs/payment/stripe/helpers/createThread';
import { updateReservation, getReservation } from '../../../libs/payment/stripe/helpers/updateReservation';
import { blockDates } from '../../../libs/payment/stripe/helpers/blockDates';
import { createTransaction } from '../../../libs/payment/paypal/helpers/createTransaction';
import { emailBroadcast } from '../../../libs/payment/stripe/helpers/email';
import { makePayPalPayment } from '../../../libs/payment/paypal/makePayPalPayment';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';
const confirmPayPalExecute = {

	type: ReservationPaymentType,

	args: {
		paymentId: { type: new NonNull(StringType) },
		payerId: { type: new NonNull(StringType) }
	},

	async resolve({ request, response }, {
		paymentId,
		payerId
	}) {

		try {
			let reservationId, reservation, status = 400, errorMessage;;
			if (request.user && !request.user.admin) {

				const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
				if (userStatusErrorMessage) {
					return {
						status: userStatusError,
						errorMessage: userStatusErrorMessage
					};
				}

				await makePayPalPayment(paymentId, payerId)
					.then(res => {
						var amount, payee, item_list, related_resources, rrAmount, rrTranscationFee, itemSKU, transactionId;
						res.transactions.map((item) => {
							amount = item.amount;
							payee = item.payee;
							item_list = item.item_list;
							related_resources = item.related_resources;
							related_resources.map((relatedItem) => {
								transactionId = relatedItem.sale && relatedItem.sale.id;
								rrAmount = relatedItem.sale && relatedItem.sale.amount;
								if (relatedItem.sale && relatedItem.sale.transaction_fee != undefined) {
									rrTranscationFee = relatedItem.sale.transaction_fee.value;
								}
							})
						})
						item_list.items.map((itemData) => {
							itemSKU = Number(itemData.sku);
						})
						let payerEmail = res.payer && res.payer.payer_info.email;
						let payerId = res.payer && res.payer.payer_info.payer_id;
						let receiverEmail = payee.email;
						let receiverId = payee.merchant_id;
						let total = rrAmount.total;
						let transactionFee = rrTranscationFee;
						let currency = rrAmount.currency;
						reservationId = itemSKU;
						updateReservation(itemSKU);
						createTransaction(
							itemSKU,
							payerEmail,
							payerId,
							receiverEmail,
							receiverId,
							transactionId,
							total,
							transactionFee,
							currency,
							""
						);
						createThread(itemSKU);
						blockDates(itemSKU);
						emailBroadcast(itemSKU);
						reservation = getReservation(itemSKU);
						status = 200;
					})
					.catch((err) => {
						status = 400;
						errorMessage = 'Something went wrong ' + err;
					});

				return {
					results: reservation,
					status,
					reservationId,
					errorMessage
				}

			} else {
				return {
					status: 500,
					errorMessage: 'Please login with your account and try again.'
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

export default confirmPayPalExecute;
