import ListPhotosType from '../../types/ListPhotosType';
import { websiteUrl } from '../../../config';
import fetch from 'node-fetch';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const RemoveMultiPhotos = {

  type: ListPhotosType,

  args: {
    photos: { type: StringType },
  },

  async resolve({ request, response }, { photos }) {
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

      const responses = await new Promise((resolve, reject) => {
        fetch(websiteUrl + '/deleteMultiFiles', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            auth: request.headers.auth
          },
          body: JSON.stringify({ files: photos }),
          method: 'post',
        }).then(res => res.json())
          .then(function (body) {
            if (body) {
              resolve(body)
            } else {
              reject(error)
            }
          });
      });
      const { status, errorMessage } = responses;

      if (status === 200) {
        return {
          status: 200,
          errorMessage
        }
      } else {
        return {
          errorMessage,
          status: 400
        }
      }
    } catch (error) {
      return {
        errorMessage: 'Something went wrong! ' + error,
        status: 400
      }
    }
  },
};

export default RemoveMultiPhotos;

/*
mutation (
    $photos: String,
) {
    RemoveMultiPhotos (
        photos: $photos) {
           status
          errorMessage
    }
}*/
