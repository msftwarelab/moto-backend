import WishListGroupType from '../../types/WishListGroupType';
import { WishListGroup, UserLogin } from '../../models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const UpdateWishListGroup = {

    type: WishListGroupType,

    args: {
        isPublic: { type: IntType },
        id: { type: IntType }
    },

    async resolve({ request, response }, { isPublic, id }) {

        let where, status = 200, errorMessage, convertedName;
        let currentToken;

        try {
            if (request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                currentToken = request.headers.auth;
                where = {
                    userId: request.user.id,
                    key: currentToken
                };

                const checkLogin = await UserLogin.findOne({
                    attributes: ['id'],
                    where
                });
                if (checkLogin) {
                    const userId = request.user.id;
                    const updateWishListGroup = await WishListGroup.update({
                        isPublic
                    }, {
                        where: {
                            id,
                            userId
                        }
                    });
                    if (updateWishListGroup && updateWishListGroup != 0) {
                        return {
                            status: 200
                        }

                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Unable to update, because invalid id of this user'
                        }

                    }
                } else {
                    return {
                        errorMessage: "You haven't authorized for this action.",
                        status: 500
                    };
                }

            } else {
                return {
                    errorMessage: "Please login for this action.",
                    status: 500
                };
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong.' + error,
                status: 400
            }
        }

    },
};

export default UpdateWishListGroup;

/*

mutation UpdateWishListGroup(
    $isPublic: Int,
    $id: Int!
){
    UpdateWishListGroup(
        isPublic: $isPublic,
        id: $id
    ) {
        status
    }
}

*/
