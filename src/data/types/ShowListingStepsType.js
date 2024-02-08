import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLNonNull as NonNull,
  GraphQLList as List,
} from 'graphql';

// Models
import { Listing, ListPhotos } from '../models';
import ShowListingType from './ShowListingType';

const ShowListingStepsType = new ObjectType({
  name: 'ShowListingSteps',
  fields: {
    id: { type: IntType },
    listId: { type: IntType },
    step1: { type: StringType },
    step2: { type: StringType },
    step3: { type: StringType },
    listing: {
      type: ShowListingType,
      resolve(userListingSteps) {
        return Listing.findOne({ where: { id: userListingSteps.listId } });
      }
    },
    currentStep: { type: IntType },
    status: { type: IntType },
    errorMessage: {
      type: StringType
    },
    isPhotosAdded:{
      type: BooleanType,
      async resolve(userListingSteps, { }, request) {
        let count = await ListPhotos.count({
          where: {
            listId: userListingSteps.listId
          },
        });
        return (count) ? true : false;
      }
    }
  },
});


const ShowListingCommonType = new ObjectType({
  name: 'ShowListingCommon',
  fields: {
    results: {
      type: ShowListingStepsType
    },
    status: {
      type: IntType
    },
    errorMessage: {
      type: StringType
    }
  }
});

export default ShowListingCommonType;
