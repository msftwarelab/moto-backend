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

const RemoveListPhotos = {

  type: ListPhotosType,

  args: {
    listId: { type: new NonNull(IntType) },
    name: { type: StringType },
  },

  async resolve({ request, response }, { listId, name }) {
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
        fetch(websiteUrl + '/deleteListPhotos', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            auth: request.headers.auth
          },
          body: JSON.stringify({ listId, fileName: name }),
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

export default RemoveListPhotos;

/*
mutation ($userId:String!, $documentId:Int) {
  RemoveDocumentList (userId:$userId, documentId: $documentId) {
    status
    photosCount
  }
}*/
