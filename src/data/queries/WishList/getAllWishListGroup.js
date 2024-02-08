import AllWishListGroupType from '../../types/AllWishListGroupType';
import { WishListGroup, UserLogin, User } from '../../models';

import {
    GraphQLInt as IntType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getAllWishListGroup = {

    type: AllWishListGroupType,

    args: {
        currentPage: { type: IntType },
    },

    async resolve({ request }, { currentPage }) {
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
                let limit = 10;
                let offset = 0;
                // Offset from Current Page
                if (currentPage) {
                    offset = (currentPage - 1) * limit;
                } else {
                    offset = 0;
                    limit = 1000;
                }
                if (checkLogin) {
                    const count = await WishListGroup.count({
                        where: {
                            userId: request.user.id
                        }
                    });

                    const wishListGroupData = await WishListGroup.findAll({
                        where: {
                            userId: request.user.id
                        },
                        limit,
                        offset
                    });
                    if (wishListGroupData && count) {

                        if (wishListGroupData && wishListGroupData.length > 0) {
                            return {
                                status: 200,
                                results: wishListGroupData,
                                count,
                            }
                        } else {
                            return {
                                status: 400,
                                errorMessage: 'Something went wrong.',
                                results: wishListGroupData,
                                count,
                            }
                        }
                        // return {
                        //     status: 200,
                        //     results: wishListGroupData,
                        //     count,
                        // }

                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Something went wrong'
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

export default getAllWishListGroup;

/*

query getAllWishListGroup($currentPage: Int){
    getAllWishListGroup(currentPage: $currentPage){
      status
        count
        results {
        id
        name
        userId
        isPublic
        updatedAt
        wishListCount
        wishListCover {
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