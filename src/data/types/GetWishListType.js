import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import WishListGroupType from './WishListGroupType';

const GetWishListType = new ObjectType({
    name: 'GetWishListType',
    fields: {
        results: { type: WishListGroupType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    }
});

export default GetWishListType;
