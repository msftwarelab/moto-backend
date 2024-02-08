import GetWishListType from '../../types/GetWishListType';
import { WishListGroup, UserLogin, User } from '../../models';

import {
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getWishListGroup = {

    type: GetWishListType,

    args: {
        id: { type: new NonNull(IntType) },
        currentPage: { type: IntType },
    },

    async resolve({ request }, { id, currentPage }) {
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

                const userData = await User.findOne({
                    attributes: [
                        'userBanStatus'
                    ],
                    where: { id: request.user.id },
                    raw: true
                })


                if (userData) {
                    if (userData.userBanStatus == 1) {
                        return {
                            errorMessage: 'You have blocked, Please contact support team.',
                            status: 500
                        }
                    }
                }

                const checkLogin = await UserLogin.findOne({
                    attributes: ['id'],
                    where
                });
                if (checkLogin && id) {

                    const wishListData = await WishListGroup.findOne({
                        where: {
                            userId: request.user.id,
                            id
                        }
                    });
                    let updatedWishListData;
                    updatedWishListData = Object.assign({}, wishListData.dataValues, { currentPage });
                    if (wishListData) {
                        return {
                            status: 200,
                            results: updatedWishListData
                        }

                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Something went wrong.'
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
    }
}

export default getWishListGroup;

/*

query getWishListGroup ($id: Int!){
    getWishListGroup(id: $id){
    status
    errorMessage
    results{
     id
        name
        userId
        isPublic
        updatedAt
        wishListCount
        wishLists {
          id
          listId
          listData {
            id
            title
            personCapacity
            beds
            bookingType
            coverPhoto
            reviewsCount,
            reviewsStarRating,
            listPhotos {
              id
              name
              type
              status
            }
            listingData {
              basePrice
              currency
            }
            settingsData {
              listsettings {
                id
                itemName
              }
            }
          }
        }
    }
    }
}


*/