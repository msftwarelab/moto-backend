import ListType from '../../types/ListType';
import { ListViews, Listing } from '../../../data/models';
import sequelize from '../../sequelize';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getMostViewedListing = {

    type: ListType,

    async resolve({ request }) {

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

            const getAllListing = Listing.findAll({
                where: {
                    isPublished: true
                },
                include: [
                    {
                        model: ListViews,
                        attributes: [],
                        as: 'listViews',
                        required: true,
                        duplicating: false
                    }
                ],
                order: [
                    [sequelize.fn('count', sequelize.col('listViews.listId')), 'DESC'],
                ],
                group: ['listViews.listId'],
                limit: 10,
                offset: 0
            });

            if (getAllListing) {
                return {
                    results: getAllListing,
                    status: 200
                }
            } else {
                return {
                    status: 400,
                    errorMessage: "Something Went Wrong"
                }
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }

    }
};

export default getMostViewedListing;

/*

{
  getMostViewedListing {
    status
    errorMessage
    results {
        id
        title
        personCapacity
        bookingType
        transmission
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
        wishListStatus
        isListOwner
        listPhotoName
        carType
    }    
  }
}

*/