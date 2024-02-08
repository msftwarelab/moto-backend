import {
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLFloat as FloatType
} from 'graphql';
import sequelize from '../../sequelize';
import { Reviews, Reservation } from '../../models';
import CommonType from '../../types/CommonType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const writeUserReview = {

    type: CommonType,

    args: {
        reservationId: { type: new NonNull(IntType) },
        listId: { type: new NonNull(IntType) },
        reviewContent: { type: new NonNull(StringType) },
        rating: { type: new NonNull(FloatType) },
        receiverId: { type: new NonNull(StringType) }
    },

    async resolve({ request }, {
        reservationId,
        listId,
        reviewContent,
        rating,
        receiverId
    }) {
        try {
            if (request.user && !request.user.admin) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                let parentId = 0, authorId = request.user.id;

                const reservationData = await Reservation.findOne({
                    attributes: ['id'],
                    where: {
                        reservationState: 'completed',
                        $or: [
                            {
                                hostId: authorId
                            },
                            {
                                guestId: authorId
                            }
                        ],
                        $and: [
                            {
                                id: reservationId
                            },
                            {
                                id: {
                                    $notIn: [
                                        sequelize.literal(`SELECT reservationId FROM Reviews WHERE authorId='${authorId}'`)
                                    ]
                                }
                            }
                        ]
                    },
                    raw: true
                });

                if (reservationData) {
                    const existingOtherReview = await Reviews.findOne({
                        attributes: ['id'],
                        where: {
                            reservationId,
                            userId: authorId
                        },
                        raw: true
                    });
                    parentId = existingOtherReview && existingOtherReview.id;

                    await Reviews.create({
                        reservationId,
                        listId,
                        authorId,
                        userId: receiverId,
                        reviewContent,
                        rating,
                        parentId
                    });

                    return await {
                        status: 200
                    };
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Oops! It looks like the review is already written or something went wrong! Please reopen the application and try again.'
                    };
                }
            } else {
                return {
                    status: 500,
                    errorMessage: 'Please login with your account and try again.'
                };
            }
        } catch (error) {
            return {
                status: 400,
                errorMessage: 'Oops! Something went wrong! ' + error
            };
        }
    }
};

export default writeUserReview;

/**
 
mutation writeUserReview($reservationId: Int!, $listId: Int!, $reviewContent: String!, $rating: Float!, $receiverId: String!) {
  writeUserReview(reservationId: $reservationId, listId: $listId, reviewContent: $reviewContent, rating: $rating, receiverId: $receiverId) {
    status
    errorMessage
  }
}


**/