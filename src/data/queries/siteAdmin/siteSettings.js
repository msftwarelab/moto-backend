import SiteSettingsCommonType from '../../types/siteadmin/SiteSettingsType';
import { SiteSettings } from '../../../data/models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const siteSettings = {

  type: SiteSettingsCommonType,

  args: {
    type: { type: StringType },
  },

  async resolve({ request }, { type }) {

    try {

      let siteSettingsData;

      if (request && request.user) {
        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }
      }

      if (type != null) {
        // Get Specific Type of Settings Data
        siteSettingsData = await SiteSettings.findAll({
          attributes: [
            'id',
            'title',
            'name',
            'value',
            'type'
          ],
          where: {
            type: type,
            name: {
              $ne: 'platformSecretKey'
            },
          }
        });

      } else {
        // Get All Site Settings Data
        siteSettingsData = await SiteSettings.findAll({
          attributes: [
            'id',
            'title',
            'name',
            'value',
            'type'
          ],
          where: {
            name: {
              $ne: 'platformSecretKey'
            },
          }
        });
      }

      return {
        status: 200,
        results: siteSettingsData
      };

    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }

  },
};

export default siteSettings;
