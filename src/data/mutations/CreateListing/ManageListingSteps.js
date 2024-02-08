import ShowListingStepsType from '../../types/ShowListingStepsType';
import { UserListingSteps, Listing } from '../../../data/models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const ManageListingSteps = {

  type: ShowListingStepsType,

  args: {
    listId: { type: new NonNull(StringType) },
    currentStep: { type: new NonNull(IntType) }
  },

  async resolve({ request }, { listId, currentStep }) {

    try {

      // Check whether user is logged in
      if (request.user || request.user.admin != true) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        let where = { id: listId };
        if (!request.user.admin) {
          where = { id: listId, userId: request.user.id };
        }

        // Confirm whether the Listing Id is available
        const isListingAvailable = await Listing.findOne({ where });
        let isUpdated = false;

        if (isListingAvailable != null) {
          // Check if record already available for this listing
          const listingSteps = await UserListingSteps.findOne({ where: { listId } });

          if (listingSteps != null) {

            // Update Step#1
            if (currentStep === 1) {
              if (listingSteps.step1 === "active") {
                const updateStep1 = await UserListingSteps.update({
                  step1: 'completed',
                  step2: 'active'
                },
                  { where: { listId } });
                // Update Status
                isUpdated = true;
              }
            }

            // Update Step#2
            if (currentStep === 2) {

              if (listingSteps.step2 === "active") {
                const updateStep2 = await UserListingSteps.update({
                  step2: 'completed',
                  step3: 'active'
                },
                  { where: { listId } });
                // Update Status
                isUpdated = true;
              }
            }

            // Update Step#3
            if (currentStep === 3) {
              if (listingSteps.step3 === "active") {
                const updateStep2 = await UserListingSteps.update({
                  step3: 'completed',
                  step4: 'completed',
                },
                  { where: { listId } });
                // Update Status
                isUpdated = true;
              }
            }

            if (isUpdated) {
              // Get updated records
              const getUpdatedRecords = await UserListingSteps.findOne({ where: { listId } });
              return {
                results: getUpdatedRecords,
                status: 200
              };
            } else {
              // No changes, return data as it is
              return {
                results: listingSteps,
                status: 200
              };
            }


          } else {
            const createListingSteps = await UserListingSteps.create({
              listId: listId,
              step1: "active"
            });
            return {
              results: createListingSteps,
              status: 200
            };
          }
        } else {
          return {
            status: 400,
            errorMessage: "Something went wrong"
          };
        }
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

export default ManageListingSteps;
