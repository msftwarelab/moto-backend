import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLList as List,
} from 'graphql';

import ShowListingType from './ShowListingType';

const ListType = new ObjectType({
    name: 'AllList',
    fields: {
        results: { 
            type: new List(ShowListingType)
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        }
    },
});

export default ListType;