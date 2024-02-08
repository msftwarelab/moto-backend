import AllReviewsType from '../../types/AllReviewsType';

import { Reviews } from '../../../data/models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getReviews = {

    type: AllReviewsType,

    args: {
        listId: { type: IntType },
        currentPage: { type: IntType },
        hostId: { type: new NonNull(StringType) },
    },

    async resolve({ request }, { listId, currentPage, hostId }) {
        try {
            const limit = 10;
            let offset = 0;
            // Offset from Current Page
            if (currentPage) {
                offset = (currentPage - 1) * limit;
            }

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            const reviews = await Reviews.findAll({
                where: {
                    listId: listId,
                    userId: hostId
                }
            });

            // Get Reviews for particular Listings
            const reviewData = await Reviews.findAll({
                where: {
                    listId: listId,
                    userId: hostId
                },
                limit,
                offset,
            });

            if (reviewData) {
                return {
                    results: reviewData,
                    count: reviews.length,
                    status: 200
                }
            } else {
                return {
                    status: 400,
                    errorMessage: 'Something went wrong'
                }
            }
        }
        catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    },
};

export default getReviews;

/*

query getReviews($listId: Int, $currentPage: Int) {
  getReviews(listId: $listId, currentPage: $currentPage) {
            id
        reservationId
        listId
        authorId
        userId
        reviewContent
        rating
        parentId
        automated
        createdAt
        userData{
            userId
            profileId
            firstName
            lastName
            picture
      }
  }
}

*/