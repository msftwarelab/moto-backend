// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLFloat as FloatType
} from 'graphql';
import moment from 'moment';

import SendMessageType from '../../types/SendMessageType';
import { sendNotifications } from '../../../helpers/sendNotifications';

// Sequelize models
import { ThreadItems, Threads, User, Reservation, ListBlockedDates, UserProfile } from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const ReservationStatus = {
    type: SendMessageType,
    args: {
        threadId: { type: new NonNull(IntType) },
        content: { type: StringType },
        type: { type: StringType },
        startDate: { type: StringType },
        endDate: { type: StringType },
        personCapacity: { type: IntType },
        reservationId: { type: IntType },
        actionType: { type: StringType },
        startTime: { type: FloatType },
        endTime: { type: FloatType }
    },
    async resolve({ request, response }, {
        threadId,
        content,
        type,
        startDate,
        endDate,
        personCapacity,
        reservationId,
        actionType,
        startTime,
        endTime
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

                const userId = request.user.id;
                let where = {
                    id: userId,
                    userBanStatus: 1
                }
                // Check whether User banned by admin
                const isUserBan = await User.findOne({ where });
                let isStatus = false;
                if (!isUserBan) {
                    let notifyUserId, notifyUserType, notifyContent;
                    let hostId, guestId, userName, messageContent, listId;

                    const getThread = await Threads.findOne({
                        where: {
                            id: threadId
                        },
                        raw: true
                    });

                    if (getThread && getThread.host && getThread.guest) {
                        notifyUserId = getThread.host === userId ? getThread.guest : getThread.host;
                        notifyUserType = getThread.host === userId ? 'renter' : 'owner';
                    }

                    const hostProfile = await UserProfile.findOne({
                        where: {
                            userId: getThread.host
                        }
                    });

                    if (hostProfile && getThread) {
                        userName = hostProfile && hostProfile.displayName ? hostProfile.displayName : hostProfile.firstName
                    }

                    listId = getThread && getThread.listId;


                    if (actionType == 'approved') {
                        const threadItems = await ThreadItems.create({
                            threadId,
                            sentBy: userId,
                            content,
                            type,
                            startDate,
                            endDate,
                            personCapacity,
                            reservationId,
                            startTime,
                            endTime
                        });
                        if (threadItems) {
                            const updateThreads = await Threads.update({
                                isRead: false,
                                messageUpdatedDate: new Date(),
                            },
                                {
                                    where: {
                                        id: threadId
                                    }
                                }
                            );
                        }

                        const updateReservation = await Reservation.update({
                            reservationState: 'approved'
                        },
                            {
                                where: {
                                    id: reservationId
                                }
                            }
                        );

                        messageContent = userName + ': ' + 'Booking is approved';

                        isStatus = true;
                        notifyContent = {
                            "screenType": "trips",
                            "title": "Approved",
                            "userType": notifyUserType.toString(),
                            "message": messageContent.toString(),
                        };
                    } else if (actionType == 'declined') {

                        const threadItems = await ThreadItems.create({
                            threadId,
                            sentBy: userId,
                            content,
                            type,
                            startDate,
                            endDate,
                            personCapacity,
                            reservationId,
                            startTime,
                            endTime
                        });
                        if (threadItems) {
                            const updateThreads = await Threads.update({
                                isRead: false,
                                messageUpdatedDate: new Date(),
                            },
                                {
                                    where: {
                                        id: threadId
                                    }
                                }
                            );
                        }

                        const updateReservation = await Reservation.update({
                            reservationState: type
                        },
                            {
                                where: {
                                    id: reservationId
                                }
                            }
                        );

                        const unlockBlockedDates = await ListBlockedDates.update({
                            reservationId: null,
                            calendarStatus: 'available'
                        }, {
                            where: {
                                reservationId,
                                calendarStatus: 'blocked',
                                isSpecialPrice: {
                                    $ne: null
                                }
                            }
                        });

                        const unblockDatesWithOutPrice = await ListBlockedDates.destroy({
                            where: {
                                reservationId,
                                calendarStatus: 'blocked',
                                isSpecialPrice: {
                                    $eq: null
                                }
                            }
                        });

                        isStatus = true;
                        messageContent = userName + ' : ' + 'Booking is declined';
                        notifyContent = {
                            "screenType": "trips",
                            "title": "Declined",
                            "userType": notifyUserType.toString(),
                            "message": messageContent.toString(),
                        };

                    }

                    if (isStatus) {
                        sendNotifications(notifyContent, notifyUserId);
                        return {
                            status: 200,
                        };
                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Something went wrong,Failed to create thread items',
                        }
                    }

                } else {
                    return {
                        status: 500,
                        errorMessage: 'Something went wrong.Userbanned'
                    }
                }
            } else {
                return {
                    status: 500,
                    errorMessage: "You are not loggedIn"
                };
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    },
};
export default ReservationStatus;

/*

mutation ReservationStatus(
        $threadId: Int!, 
        $content: String, 
        $type: String,
        $startDate: String,
        $endDate: String,
        $personCapacity: Int,
        $reservationId: Int,
        $actionType: String,
    $startTime: Float,
    $endTime: Float
) {
 ReservationStatus(	
          threadId: $threadId, 
          content: $content, 
          type: $type,
      startDate: $startDate,
      endDate: $endDate,
      personCapacity: $personCapacity,
      reservationId: $reservationId,
      actionType: $actionType,
      startTime: $startTime,
      endTime: $endTime
) {
   status
   errorMessage

  }
}

*/
