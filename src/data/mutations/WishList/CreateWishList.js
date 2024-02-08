import WishListType from '../../types/WishListType';
import { WishListGroup, UserLogin, WishList, Listing } from '../../models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const CreateWishList = {

    type: WishListType,

    args: {
        listId: { type: IntType },
        wishListGroupId: { type: IntType },
        eventKey: { type: BooleanType }
    },

    async resolve({ request, response }, { listId, wishListGroupId, eventKey }) {

        let where, status = 200, errorMessage, convertedName;
        let currentToken;
        listId = listId ? listId : '';
        wishListGroupId = wishListGroupId ? wishListGroupId : '';
        let resultsData;
        let eventkeyValue;
        resultsData = {
            listId,
            eventkeyValue: eventKey,
            wishListGroupId
        }
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
                    let updateWishList;
                    const isListOwner = await Listing.count({
                        where: {
                            userId,
                            id: listId
                        }
                    });
                    const isListExist = await Listing.count({
                        where: {
                            id: listId
                        }
                    });
                    if (isListExist) {
                        if (isListOwner) {
                            return {
                                status: 400,
                                errorMessage: 'Something went wrong'
                            };
                        } else {
                            let checkWishListGroupId = await WishListGroup.findOne({
                                where: {
                                    userId,
                                    id: wishListGroupId
                                }
                            });
                            if (checkWishListGroupId) {
                                // Wish Lists
                                if (eventKey === true) {
                                    let checkWishListIdExist = await WishList.findOne({
                                        where: {
                                            userId,
                                            wishListGroupId,
                                            listId
                                        }
                                    });
                                    if (!checkWishListIdExist) {
                                        updateWishList = await WishList.create({
                                            listId,
                                            userId,
                                            wishListGroupId,
                                            isListActive: true
                                        });
                                    } else {
                                        return {
                                            status: 200,
                                            results: resultsData
                                        }
                                    }

                                } else {
                                    updateWishList = await WishList.destroy({
                                        where: {
                                            listId,
                                            userId,
                                            wishListGroupId
                                        }
                                    });
                                }
                                return {
                                    status: 200,
                                    results: resultsData
                                }
                            } else {
                                return {
                                    status: 400,
                                    errorMessage: 'Invalid Group Id'
                                }
                            }
                        }
                    } else {
                        return {
                            errorMessage: "Something went wrong,List is not exist.",
                            status: 400
                        };
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

export default CreateWishList;

/*

mutation CreateWishList(
    $listId: Int!,
    $wishListGroupId:Int,
    $eventKey:Boolean,
){
    CreateWishList(
        listId: $listId,
        wishListGroupId: $wishListGroupId,
        eventKey: $eventKey,
    ) {
        status
    }
}

*/
