import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLList as List,
} from 'graphql';

import ShowListingType from './ShowListingType';

const searchListingType = new ObjectType({
  name: 'SearchListing',
  fields: {
    count: { type: IntType },
    currentPage: { type: IntType },
    results: { type: new List(ShowListingType) },
    status: { type: IntType },
    errorMessage: { type: StringType }
  },
});

export default searchListingType;