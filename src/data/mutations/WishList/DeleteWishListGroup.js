import WishListGroupType from '../../types/WishListGroupType';
import { WishListGroup, WishList, UserLogin } from '../../models';

import {
    GraphQLInt as IntType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const DeleteWishListGroup = {

    type: WishListGroupType,

    args: {
        id: { type: IntType }
    },

    async resolve({ request, response }, { id }) {

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

                const userId = request.user.id;
                let isWishGroupDeleted = false, isWishListsDeleted = false;
                const isListAvailable = await WishListGroup.count({
                    where: {
                        userId,
                        id
                    }
                });

                if (isListAvailable && isListAvailable > 0) {
                    // Delete Wish List Group
                    const deleteGroup = await WishListGroup.destroy({
                        where: {
                            userId,
                            id
                        }
                    })
                        .then(function (instance) {
                            // Check if any rows are affected
                            if (instance > 0) {
                                isWishGroupDeleted = true;
                            }
                        });

                    // Delete Wish Lists
                    const deleteLists = await WishList.destroy({
                        where: {
                            userId,
                            wishListGroupId: id
                        }
                    })
                        .then(function (instance) {
                            isWishListsDeleted = true;
                        });

                    if (isWishGroupDeleted === true && isWishListsDeleted === true && checkLogin) {
                        return {
                            status: 200
                        }
                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Something went wrong,Unable to delete'
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

export default DeleteWishListGroup;

/*

mutation DeleteWishListGroup(
    $id: Int!,
){
    DeleteWishListGroup(
        id: $id
    ) {
        status
    }
}

*/
