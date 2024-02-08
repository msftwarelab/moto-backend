// GrpahQL
import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLFloat as FloatType,
} from 'graphql';

import ReviewCommonType from '../../types/ReviewCommonType';

// Sequelize models
import { Reviews, UserProfile } from '../../models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const userReviews = {

    type: ReviewCommonType,

    args: {
        ownerType: { type: StringType },
        currentPage: { type: IntType },
        profileId: { type: IntType },
    },

    async resolve({ request, response }, { ownerType, currentPage, profileId }) {
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

            let limit = 10;
            let offset = 0;
            let where = {};
            let userId;

            if (currentPage) {
                offset = (currentPage - 1) * limit;
            }

            if (profileId) {
                const getUser = await UserProfile.findOne({
                    where: {
                        profileId
                    }
                });
                userId = getUser.userId;
            } else {
                if (request.user && !request.user.admin) {
                    userId = request.user.id;
                }
            }


            if (ownerType === 'me') {
                where = {
                    authorId: userId
                };
            } else {
                where = {
                    userId
                };
            }

            const results = await Reviews.findAll({
                where,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            if (results && results.length > 0) {
                return await {
                    status: 200,
                    results
                }
            } else {
                return await {
                    status: 400,
                    errorMessage: 'Sorry, no records found!'
                }
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            }
        }
    },
};

export default userReviews;