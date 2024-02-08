import ShowListingStepsType from '../../types/ShowListingStepsType';
import { UserListingSteps } from '../../../data/models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const showListingSteps = {

  type: ShowListingStepsType,

  args: {
    listId: { type: new NonNull(StringType) },
  },

  async resolve({ request }, { listId }) {

    try {

      // Check if user already logged in
      if (request.user) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        // Get All Listing Data
        const listingSteps = await UserListingSteps.findOne({
          attributes: [
            'id',
            'listId',
            'step1',
            'step2',
            'step3'
          ],
          where: {
            listId: listId
          }
        });
        if (listingSteps) {
          return {
            results: listingSteps,
            status: 200
          }
        } else {
          return {
            status: 400,
            errorMessage: "Something went wrong",
          };
        }

        // return listingSteps;

      } else {
        return {
          status: 500,
          errorMessage: "You are not LoggedIn",
        };
      }

    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }

  },
};

export default showListingSteps;
