import {
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType
} from 'graphql';
import { Reviews, Listing } from '../../models';
import ReviewCommonType from '../../types/ReviewCommonType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getPropertyReviews = {

    type: ReviewCommonType,

    args: {
        listId: { type: new NonNull(IntType) },
        currentPage: { type: new NonNull(IntType) }
    },

    async resolve({ request }, { listId, currentPage }) {
        try {

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            let offset = 0, limit = 10, where = {};
            if (currentPage) offset = (currentPage - 1) * limit;

            const listingData = await Listing.findOne({
                attributes: ['userId'],
                where: {
                    id: listId
                },
                raw: true
            });

            if (listingData) {
                where = {
                    listId,
                    userId: listingData.userId,
                    isAdminEnable: true
                };

                const results = await Reviews.findAll({
                    where,
                    offset,
                    limit,
                    order: [['createdAt', 'DESC']]
                });

                const count = await Reviews.count({ where });

                return await {
                    status: count > 0 && results && results.length > 0 ? 200 : 400,
                    results,
                    count,
                    currentPage,
                    errorMessage: count > 0 && results && results.length > 0 ? null : 'No reviews found!'
                };
            } else {
                return {
                    status: 400,
                    errorMessage: 'Oops! Unable to find the property. Please try again.'
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

export default getPropertyReviews;