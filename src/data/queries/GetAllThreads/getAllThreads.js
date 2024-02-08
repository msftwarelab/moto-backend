// GrpahQL
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import AllThreadsType from '../../types/AllThreadsType';
import { Threads, ThreadItems, User } from '../../../data/models';
//   import sequelize from '../sequelize';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const GetAllThreads = {

  type: AllThreadsType,

  args: {
    threadType: { type: StringType },
    threadId: { type: IntType },
    currentPage: { type: IntType },
  },

  async resolve({ request }, { threadType, threadId, currentPage }) {

    try {
      const limit = 10;
      let offset = 0;
      // Offset from Current Page
      if (currentPage) {
        offset = (currentPage - 1) * limit;
      }
      // Check if user already logged in
      if (request.user && !request.user.admin) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        let where = {};

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

        // For Getting Specific type of threads of a logged in user(Either 'owner' or 'renter')
        if (threadType === 'owner') {
          where = {
            host: request.user.id
          }
        } else {
          where = {
            guest: request.user.id
          }
        }

        // For Getting Specific Thread
        if (threadId != undefined && threadId != null) {
          where = Object.assign({}, where, { id: threadId });
        }

        const count = await Threads.count({ where });

        const threadsData = await Threads.findAll({
          where,
          order: [['messageUpdatedDate', 'DESC']],
          limit,
          offset,
        });

        if (threadsData.length > 0) {
          return {
            status: 200,
            results: threadsData,
            count,
          };
        }
        else {
          return {
            status: 400,
            errorMessage: "Something went wrong"
          };
        }
      } else {
        return {
          status: 500,
          errorMessage: "You are not LoggedIn"
        };
      }
    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  }
};

export default GetAllThreads;
