import WholeManageListingsType from '../../types/WholeManageListingsType';

import { Listing, User } from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const ManageListings = {

  type: WholeManageListingsType,

  // args: {
  //   isReady: { type: BooleanType }
  // },

  async resolve({ request }) {

    try {
      if (request.user && request.user.admin != true) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        const userId = request.user.id;
        const userEmail = await User.findOne({
          attributes: [
            'email',
            'userBanStatus'
          ],
          where: {
            id: userId,
            userDeletedAt: {
              $eq: null
            },
          },
          order: [
            [`createdAt`, `DESC`],
          ],
        });

        if (userEmail && !userEmail.userBanStatus) {

          // Get listingData
          const listingData = await Listing.findAll({
            where: {
              userId: request.user.id,
              //isReady: true
            },
            order: [
              [`createdAt`, `DESC`],
            ],
          });

          if (listingData) {
            return {
              results: listingData,
              status: 200
            }
          } else {
            return {
              status: 400,
              errorMessage: "Something Went Wrong"
            }
          }
        } else {
          return {
            status: 500,
            errorMessage: 'Something went wrong. Please contact support.'
          }
        }
      } else {
        return {
          status: 500,
          errorMessage: "You are not LoggedIn",
        };
      }

    }
    catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  },
};

export default ManageListings;
