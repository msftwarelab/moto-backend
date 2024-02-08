import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ShowListingType from './ShowListingType';

const ListingType = new ObjectType({
    name: 'AllListing',
    fields: {
        results: { type: ShowListingType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default ListingType;