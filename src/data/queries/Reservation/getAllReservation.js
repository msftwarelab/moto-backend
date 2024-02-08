import AllReservationType from '../../types/AllReservationType';
import { Reservation, User } from '../../models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getAllReservation = {

    type: AllReservationType,

    args: {
        userType: { type: StringType },
        currentPage: { type: IntType },
        dateFilter: { type: StringType }
    },

    async resolve({ request }, { userType, currentPage, dateFilter }) {

        try {

            const limit = 10;
            let offset = 0;
            // Offset from Current Page

            if (currentPage) {
                offset = (currentPage - 1) * limit;
            }
            if (request.user && request.user.id) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                const userId = request.user.id;

                let where, order;
                let paymentState = 'completed';
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                let statusFilter = {
                    $in: ['pending', 'approved']
                };

                if (dateFilter == 'previous') {
                
                    statusFilter = {
                        $in: ['expired', 'completed', 'cancelled', 'declined']
                    };
                }

                    if (userType === 'owner') {
                        where = {
                            hostId: userId,
                            paymentState,
                            reservationState: statusFilter

                        };
                    } else {
                        where = {
                            guestId: userId,
                            paymentState,
                            reservationState: statusFilter

                        };
                    }

                const userData = await User.findOne({
                    attributes: ['userBanStatus'],
                    where: { id: request.user.id },
                    raw: true
                })


                if (userData && userData.userBanStatus == 1) {
                    return await {
                        errorMessage: 'You have blocked, Please contact support team.',
                        status: 500
                    };
                }
               order =  dateFilter == 'previous' ? [['checkIn', 'DESC']] : [['checkIn', 'ASC']]
                const count = await Reservation.count({ where });

                const reservationData = await Reservation.findAll({
                    where,
                    order,
                    limit: limit,
                    offset: offset,
                });
                
                if (reservationData && reservationData.length > 0) {
                    return {
                        result: reservationData,
                        count,
                        status: 200
                    };
                } else if (reservationData && reservationData.length == 0) {
                    return {
                        status: 400,
                        result: [],
                        count: 0,
                        errorMessage: "Sorry, No bookings found!"
                    };
                } else {
                    return {
                        status: 400,
                        result: [],
                        errorMessage: "Oops! something went wrong! Please try again."
                    };
                }
            } else {
                return {
                    status: 500,
                    errorMessage: "Oops! Please login with your account!",
                };
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    }
};

export default getAllReservation;

/**

query getAllReservation ($userType: String){
  getAllReservation(userType: $userType){
    id
    listId
    checkIn
    checkOut
    guestServiceFee
    hostServiceFee
    reservationState
        total
    message {
      id
    }
    listData {
      id
      title
      street
      city
      state
      country
    }
    hostData {
      profileId
      displayName
      picture
    }
    guestData {
      profileId
      displayName
      picture
    }
  }
}

**/