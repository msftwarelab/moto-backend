import ListSettingsCommonType from '../../types/ListingSettingsType';

import { ListSettings, ListSettingsTypes } from '../../../data/models';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getListingSettingsCommon = {

  type: ListSettingsCommonType,

  args: {
    step: { type: StringType }
  },

  async resolve({ request }, { step }) {
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


      let where;
      if (step != undefined) {
        where = { where: { step: step } };
      }

      where = Object.assign({}, where, { isEnable: true });

      const getResults = await ListSettingsTypes.findAll({
        ...where
      });

      if (!getResults) {
        return await {
          status: 400,
          errorMessage: "Something went wrong!",
          results: []
        }
      }

      return await {
        status: 200,
        results: getResults
      };
    }
    catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  },

};

export default getListingSettingsCommon;

/*

{
    getListingSettingsCommon {
      status
      errorMessage
      results {
        id
        typeName
        fieldType
        typeLabel
        step
        isEnable
        listSettings {
          id
          typeId
          itemName
          otherItemName
          maximum
          minimum
          startValue
          endValue
          isEnable
          makeType
        }
      }
    }
  }


*/