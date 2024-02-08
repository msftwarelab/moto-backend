// GrpahQL
import {
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as FloatType
} from 'graphql';
import SendMessageType from '../../types/SendMessageType';
// Sequelize models
import { ThreadItems, Threads, User, UserProfile } from '../../../data/models';
import { sendNotifications } from '../../../helpers/sendNotifications';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const SendMessage = {
  type: SendMessageType,
  args: {
    threadId: { type: new NonNull(IntType) },
    content: { type: StringType },
    type: { type: StringType },
    startDate: { type: StringType },
    endDate: { type: StringType },
    personCapacity: { type: IntType },
    reservationId: { type: IntType },
    startTime: { type: FloatType },
    endTime: { type: FloatType }
  },
  async resolve({ request, response }, {
    threadId,
    content,
    type,
    startDate,
    endDate,
    personCapacity,
    reservationId,
    startTime,
    endTime
  }) {

    try {
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
        let where = {
          id: userId,
          userBanStatus: 1
        };
        let notifyUserId, guestId, hostId, notifyUserType, messageContent;
        let userName, listId, notifyContent = {};

        // Check whether User banned by admin
        const isUserBan = await User.findOne({ where });
        if (!isUserBan) {
          // Create a thread item
          const threadItems = await ThreadItems.create({
            threadId,
            sentBy: userId,
            content,
            type,
            startDate,
            endDate,
            personCapacity,
            reservationId,
            startTime,
            endTime
          });
          if (threadItems) {

            const updateThreads = await Threads.update({
              isRead: false,
              messageUpdatedDate: new Date(),
            },
              {
                where: {
                  id: threadId
                }
              }
            );

            const getThread = await Threads.findOne({
              where: {
                id: threadId
              },
              raw: true
            });

            if (getThread && getThread.host && getThread.guest) {
              notifyUserId = getThread.host === userId ? getThread.guest : getThread.host;
              notifyUserType = getThread.host === userId ? 'renter' : 'owner';
              guestId = getThread.host === userId ? getThread.guest : getThread.host;
              hostId = getThread.host === userId ? getThread.host : getThread.guest;
              listId = getThread.listId;
            }



            const hostProfile = await UserProfile.findOne({
              where: {
                userId: getThread.host
              }
            });

            const guestProfile = await UserProfile.findOne({
              where: {
                userId: getThread.guest
              }
            });

            if (hostProfile && guestProfile && getThread) {
              //  userName = getThread.host === userId ? (guestProfile && guestProfile.displayName) : (hostProfile && hostProfile.displayName);
              userName = getThread.host === userId ? (hostProfile && hostProfile.displayName) : (guestProfile && guestProfile.displayName);
            }

            messageContent = userName + ': ' + content;



            notifyContent = {
              "screenType": "message",
              "title": "New Message",
              "userType": notifyUserType.toString(),
              "message": messageContent.toString(),
              "threadId": threadId.toString(),
              "guestId": guestId.toString(),
              "guestName": guestProfile && ((guestProfile.displayName).toString()),
              "guestPicture": (guestProfile && guestProfile.picture) ? ((guestProfile.picture).toString()) : '',
              "hostId": hostId.toString(),
              "hostName": hostProfile && ((hostProfile.displayName).toString()),
              "hostPicture": (hostProfile && hostProfile.picture) ? ((hostProfile.picture).toString()) : '',
              "guestProfileId": guestProfile && ((guestProfile.profileId).toString()),
              "hostProfileId": hostProfile && ((hostProfile.profileId).toString()),
              "listId": listId.toString()
            };

            if (type == 'preApproved') {


              messageContent = userName + ': ' + 'Your request is pre-approved';

              notifyContent = {
                "screenType": "message",
                "title": "New Booking",
                "userType": "renter",
                "message": messageContent.toString(),
                "threadId": threadId.toString(),
                "guestId": guestId.toString(),
                "guestName": guestProfile && ((guestProfile.displayName).toString()),
                "guestPicture": (guestProfile && guestProfile.picture) ? ((guestProfile.picture).toString()) : '',
                "hostId": hostId.toString(),
                "hostName": hostProfile && ((hostProfile.displayName).toString()),
                "hostPicture": (hostProfile && hostProfile.picture) ? ((hostProfile.picture).toString()) : '',
                "guestProfileId": guestProfile && ((guestProfile.profileId).toString()),
                "hostProfileId": hostProfile && ((hostProfile.profileId).toString()),
                "listId": listId.toString()
              };



            }

            // sendNotifications(notifyContent, notifyUserId);
            if (type !== 'approved' && type !== 'declined') {
              sendNotifications(notifyContent, notifyUserId);
            }

            return {
              results: threadItems,
              status: 200,
            };

          } else {
            return {
              status: 400,
              errorMessage: 'Something went wrong,Failed to create thread items',
            }
          }

        } else {
          return {
            status: 500,
            errorMessage: 'Something went wrong.Userbanned'
          }
        }
      } else {
        return {
          status: 500,
          errorMessage: "You are not loggedIn"
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
export default SendMessage;
