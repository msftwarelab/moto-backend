import { User, Reservation, Reviews, Listing, Threads, ThreadItems } from '../../models';
import UserCommonType from '../../types/UserCommonType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const deleteUser = {
	type: UserCommonType,

	async resolve({ request }) {
		try {
			let userId;
			if (request.user && request.user.id) {

				const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
				if (userStatusErrorMessage) {
					return {
						status: userStatusError,
						errorMessage: userStatusErrorMessage
					};
				}

				userId = request.user.id;
				const findActiveReservation = await Reservation.count({
					where: {
						paymentState: 'completed',
						reservationState: {
							$in: ['pending', 'approved']
						},
						$or: [{
							hostId: userId,
						}, {
							guestId: userId
						}]
					}
				});

				if (findActiveReservation > 0) {
					return {
						status: 400,
						errorMessage: 'It seems you have an active bookings, please cancel or complete the booking in order to delete your account. Contact Support if you need any help on this.'
					};
				}

				const updateUserStatus = await User.update({
					userDeletedAt: new Date(),
					userDeletedBy: userId,
				}, {
					where: {
						id: userId
					}
				});

				if (updateUserStatus) {
					const deleteUserReviews = await Reviews.destroy({
						where: {
							authorId: userId
						}
					});

					const unPublishList = await Listing.update({
						isPublished: false
					}, {
						where: {
							userId
						}
					});

					const findThreads = await Threads.findAll({
						attributes: ['id', 'host'],
						where: {
							$or: [
								{
									host: userId
								},
								{
									guest: userId
								}
							]
						},
						raw: true
					});

					if (findThreads && findThreads.length > 0) {
						findThreads.map(async (item, key) => {
							const checkEnquiry = await ThreadItems.findOne({
								attributes: ['id', 'type', 'startDate', 'endDate', 'personCapacity', 'startTime', 'endTime'],
								where: {
									threadId: item.id,
								},
								limit: 1,
								order: [['createdAt', 'DESC']],
								raw: true
							});

							if (checkEnquiry && checkEnquiry.type == 'inquiry') {
								const thread = await ThreadItems.create({
									threadId: item.id,
									sentBy: userId,
									type: userId === item.host ? 'cancelledByHost' : 'cancelledByGuest',
									startDate: checkEnquiry.startDate,
									endDate: checkEnquiry.endDate,
									personCapacity: checkEnquiry.personCapacity,
									startTime: checkEnquiry.startTime,
									endTime: checkEnquiry.endTime,
								});
							}
						});
					}

				}
				return {
					status: updateUserStatus ? 200 : 400,
					errorMessage: updateUserStatus ? null : 'Oops! Sorry your account could not be deleted! Please contact our support team.'
				}
			} else {
				return {
					status: 500,
					errorMessage: "Please login with your account and try again."
				}
			}
		} catch (error) {
			return {
				status: 400,
				errorMessage: 'Oops! Something went wrong. ' + error
			};
		}
	}
};

export default deleteUser;