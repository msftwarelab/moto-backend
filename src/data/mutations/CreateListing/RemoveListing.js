//import ShowListingType from '../types/ShowListingType';
import ListPhotosCommonType from '../../types/ListPhotosType';

import { Listing, ListPhotos, Reviews, WishList, Reservation } from '../../models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const RemoveListing = {

  type: ListPhotosCommonType,

  args: {
    listId: { type: new NonNull(IntType) },
  },

  async resolve({ request }, { listId }) {

    try {

      // Check whether user is logged in
      if (request.user) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        const getReservationCount = await Reservation.count({
          where: {
            listId,
            paymentState: 'completed',
            $or: [
              {

                reservationState: 'approved'
              },
              {
                reservationState: 'pending'
              }
            ],
          },
        });

        if (getReservationCount > 0) {
          return {
            status: 400,
            errorMessage: 'You cannot delete this list as it has upcoming bookings or enquiries'
          }
        } else {
          const getPhotos = await ListPhotos.findAll({
            where: { listId }
          });

          const removelisting = await Listing.destroy({
            where: {
              id: listId
            }
          });

          const removeReviews = await Reviews.destroy({
            where: {
              listId
            }
          });

          if (removelisting > 0) {
            return {
              results: getPhotos,
              status: 200
            }
          } else {
            return {
              status: 400,
              errorMessage: 'Something went wrong'
            }
          }
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

export default RemoveListing;