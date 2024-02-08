// GrpahQL
import {
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull
} from 'graphql';
import sequelize from '../../sequelize';
import { Reservation } from '../../models';
import CommonReservationType from '../../types/Reservation/CommonReservationType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getPendingUserReview = {

    type: CommonReservationType,

    args: {
        reservationId: { type: new NonNull(IntType) }
    },

    async resolve({ request }, { reservationId }) {
        try {
            let userId, where = {};
            if (request && request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                userId = request.user.id;

                where = {
                    reservationState: 'completed',
                    $or: [
                        {
                            hostId: userId
                        },
                        {
                            guestId: userId
                        }
                    ],
                    $and: [
                        {
                            id: reservationId
                        },
                        {
                            id: {
                                $notIn: [
                                    sequelize.literal(`SELECT reservationId FROM Reviews WHERE authorId='${userId}'`)
                                ]
                            }
                        }
                    ]
                };

                const result = await Reservation.findOne({
                    attributes: ['id', 'reservationState', 'guestId', 'hostId', 'listId'],
                    where
                });

                return await {
                    status: result ? 200 : 400,
                    result,
                    errorMessage: result ? null : 'No reviews found!'
                };
            } else {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and try again.'
                };
            }
        } catch (error) {
            return {
                status: 400,
                errorMessage: 'Oops! Something went wrong. ' + error
            };
        }
    }
};

export default getPendingUserReview;