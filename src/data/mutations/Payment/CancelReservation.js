// GrpahQL
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import ReservationCommonType from '../../types/ReservationCommonType';
import { sendNotifications } from '../../../helpers/sendNotifications';

import { sendEmail } from '../../../libs/sendEmail';

// Sequelize models
import { Reservation, Listing, ListBlockedDates, CancellationDetails, Threads, ThreadItems, UserProfile, User } from '../../models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

import moment from 'moment';

const CancelReservation = {

  type: ReservationCommonType,

  args: {
    reservationId: { type: new NonNull(IntType) },
    cancellationPolicy: { type: new NonNull(StringType) },
    refundToGuest: { type: new NonNull(FloatType) },
    payoutToHost: { type: new NonNull(FloatType) },
    guestServiceFee: { type: new NonNull(FloatType) },
    hostServiceFee: { type: new NonNull(FloatType) },
    total: { type: new NonNull(FloatType) },
    currency: { type: new NonNull(StringType) },
    threadId: { type: new NonNull(IntType) },
    cancelledBy: { type: new NonNull(StringType) },
    message: { type: new NonNull(StringType) },
    checkIn: { type: new NonNull(StringType) },
    checkOut: { type: new NonNull(StringType) },
    guests: { type: new NonNull(IntType) },
    startTime: { type: new NonNull(FloatType) },
    endTime: { type: new NonNull(FloatType) }
  },

  async resolve({ request, response }, {
    reservationId,
    cancellationPolicy,
    refundToGuest,
    payoutToHost,
    guestServiceFee,
    hostServiceFee,
    total,
    currency,
    threadId,
    cancelledBy,
    message,
    checkIn,
    checkOut,
    guests,
    startTime,
    endTime
  }) {

    try {

      let isReservationUpdated = false;
      // Check if user already logged in
      if (request.user && !request.user.admin) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        const userId = request.user.id;

        let toEmail, emailContent = {}, emailType;

        let where = {
          id: userId,
          userBanStatus: 1
        };

        let notifyUserId, notifyUserType, notifyContent;
        let userName, messageContent, today, startInDate, endInDate;
        let isClaimCancelStatus;

        // Check whether User banned by admin
        const isUserBan = await User.findOne({ attributes: ['id'], where, raw: true });
        today = moment().format('YYYY-MM-DD');
        startInDate = moment(checkIn).format('YYYY-MM-DD');
        endInDate = moment(checkOut).format('YYYY-MM-DD');
        isClaimCancelStatus = moment(today).isBetween(startInDate, endInDate, undefined, '[]')

        if (!isUserBan) {
          const getThread = await Threads.findOne({
            where: {
              id: threadId
            },
            raw: true
          });

          if (getThread && getThread.host && getThread.guest) {
            notifyUserId = getThread.host === userId ? getThread.guest : getThread.host;
            notifyUserType = getThread.host === userId ? 'renter' : 'owner';
          }

          const hostProfile = await UserProfile.findOne({
            attributes: ['firstName', 'displayName'],
            where: {
              userId: getThread.host
            },
            raw: true
          });

          const guestProfile = await UserProfile.findOne({
            attributes: ['firstName', 'displayName'],
            where: {
              userId: getThread.guest
            },
            raw: true
          });

          const guestEmail = await User.findOne({
            attributes: ['email'],
            where: {
              id: getThread.guest
            },
            raw: true
          });

          const hostEmail = await User.findOne({
            attributes: ['email'],
            where: {
              id: getThread.host
            },
            raw: true
          });

          const listingData = await Listing.findOne({
            attributes: ['id', 'title'],
            where: {
              id: getThread.listId
            },
            raw: true
          });

          const reservationData = await Reservation.findOne({
            attributes: ['id', 'confirmationCode'],
            where: {
              id: reservationId
            },
            raw: true
          });


          if (hostProfile && guestProfile && getThread) {
            userName = getThread.host === userId ? (hostProfile && hostProfile.displayName) : (guestProfile && guestProfile.displayName);
          }

          const count = await Reservation.count({
            where: {
              id: reservationId,
              reservationState: 'cancelled'
            }
          });

          if (count > 0) {
            return await {
              status: 400,
              errorMessage: 'Oops! The reservation is already canceled.',
            };
          }

          // Update Reservation table     
          await Reservation.update({
            reservationState: 'cancelled',
            isClaimCancelStatus
          }, {
            where: {
              id: reservationId
            }
          }).then(function (instance) {
            // Check if any rows are affected
            if (instance > 0) {
              isReservationUpdated = true;
            }
          });

          // Unblock the blocked dates only if guest cancels the reservation
          if (cancelledBy === 'renter') {

            const unlockBlockedDates = await ListBlockedDates.update({
              reservationId: null,
              calendarStatus: 'available'
            }, {
              where: {
                reservationId,
                calendarStatus: 'blocked',
                isSpecialPrice: {
                  $ne: null
                }
              }
            });

            const unblockDatesWithOutPrice = await ListBlockedDates.destroy({
              where: {
                reservationId,
                calendarStatus: 'blocked',
                isSpecialPrice: {
                  $eq: null
                }
              }
            });

            emailContent = {
              hostName: hostProfile.firstName,
              guestName: guestProfile.firstName,
              confirmationCode: reservationData.confirmationCode,
              checkIn,
              listTitle: listingData.title,
              payoutToHost,
              currency
            };

            toEmail = hostEmail.email;
          } else {
            emailContent = {
              hostName: hostProfile.firstName,
              guestName: guestProfile.firstName,
              confirmationCode: reservationData.confirmationCode,
              checkIn,
              listTitle: listingData.title,
              refundToGuest,
              currency
            };

            toEmail = guestEmail.email;
          }

          // Create record for cancellation details
          const cancellation = CancellationDetails.create({
            reservationId,
            cancellationPolicy,
            refundToGuest,
            payoutToHost,
            guestServiceFee,
            hostServiceFee,
            total,
            currency,
            cancelledBy: cancelledBy === 'owner' ? 'host' : 'guest'
          });

          // Create thread items
          const thread = ThreadItems.create({
            threadId,
            reservationId,
            sentBy: userId,
            content: message,
            type: cancelledBy === 'owner' ? 'cancelledByHost' : 'cancelledByGuest',
            startDate: checkIn,
            endDate: checkOut,
            personCapacity: guests,
            startTime,
            endTime
          });

          messageContent = userName + ': ' + message;


          const updateThreads = await Threads.update({
            isRead: false,
            messageUpdatedDate: new Date()
          },
            {
              where: {
                id: threadId
              }
            }
          );

          notifyContent = {
            "screenType": "trips",
            "title": 'Booking is cancelled',
            "userType": notifyUserType.toString(),
            "message": messageContent.toString()
          };

          emailType = cancelledBy === 'owner' ? 'cancelledByHost' : 'cancelledByGuest';

          if (isReservationUpdated) {
            sendNotifications(notifyContent, notifyUserId);

            await sendEmail(toEmail, emailType, emailContent);

            return await {
              status: 200
            }
          } else {
            return {
              errorMessage: 'Cancel Reservation not updated',
              status: 400
            };
          }
        } else {
          return await {
            status: 500,
            errorMessage: 'Oops! it looks like you are banned. Please contact our support team.'
          }
        }
      } else {
        return {
          errorMessage: 'You are not loggedIn',
          status: 500
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

export default CancelReservation;

/*

mutation CancelReservation(
    $reservationId: Int!,
    $cancellationPolicy: String!,
    $refundToGuest: Float!,
    $payoutToHost: Float!
    $guestServiceFee: Float!
    $hostServiceFee: Float!
    $total: Float!,
    $currency: String!,
      $threadId: Int!,
    $cancelledBy: String!
    $message: String!,
    $checkIn: String!,
    $checkOut: String!
    $guests: Int!,
    $startTime: Float!,
    $endTime: Float!
) {
CancelReservation(
    reservationId: $reservationId,
    cancellationPolicy: $cancellationPolicy,
    refundToGuest: $refundToGuest,
    payoutToHost: $payoutToHost
    guestServiceFee: $guestServiceFee,
    hostServiceFee: $hostServiceFee,
    total: $total,
    currency: $currency,
    threadId: $threadId,
    cancelledBy: $cancelledBy,
    message: $message,
    checkIn: $checkIn,
    checkOut: $checkOut
    guests: $guests,
    startTime: $startTime,
    endTime: $endTime
) {
 status
 errorMessage

}


*/