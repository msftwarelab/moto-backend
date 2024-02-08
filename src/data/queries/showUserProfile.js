import ShowUserProfileCommonType from '../types/ShowUserProfileType';
import { User, UserLogin, UserClaim, UserProfile } from '../../data/models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import checkUserBanStatus from '../../libs/checkUserBanStatus';

const showUserProfile = {

  type: ShowUserProfileCommonType,

  args: {
    profileId: { type: IntType },
    isUser: { type: BooleanType },
  },

  async resolve({ request }, { profileId, isUser }) {
    try {
      let where;

      if (request && request.user) {
        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }
      }

      if (isUser) {
        let userId = request.user.id;
        where = {
          userId
        };
      } else {
        where = {
          profileId
        };
      }

      // Get All User Profile Data
      const userData = await UserProfile.findOne({
        attributes: [
          'userId',
          'profileId',
          'firstName',
          'lastName',
          'dateOfBirth',
          'gender',
          'phoneNumber',
          'preferredLanguage',
          'preferredCurrency',
          'location',
          'info',
          'createdAt',
          'picture'
        ],
        where
      });

      if (userData) {
        return {
          status: 200,
          results: userData
        };
      } else {
        return {
          status: 400,
          errorMessage: 'Something went wrong',
        };
      }


    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      }
    }

  },
};

export default showUserProfile;
