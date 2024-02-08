import ShowListingType from '../../types/ShowListingType';
import { Listing, Recommend } from '../../../data/models';
import ListType from '../../types/ListType';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getRecommend = {

  // type: new List(ShowListingType),
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

      // Get Recommended Listings
      const getRecommendList = Listing.findAll({
        where: {
          isPublished: true
        },
        include: [
          { model: Recommend, as: "recommend", required: true },
        ]
      });
      if (getRecommendList) {
        return {
          results: getRecommendList,
          status: 200
        }
      } else {
        return {
          status: 400,
          errorMessage: "Something Went Wrong"
        }
      }
    }
    catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  }
};

export default getRecommend;

/*

{
  getRecommend {
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