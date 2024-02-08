import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
} from 'graphql';

import WishListGroupType from './WishListGroupType';

const AllWishListGroupType = new ObjectType({
    name: 'AllWishListGroup',
    fields: {
        results: { type: new List(WishListGroupType) },
        count: { type: IntType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    }
});

export default AllWishListGroupType;
