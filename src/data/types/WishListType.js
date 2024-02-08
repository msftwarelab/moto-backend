import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
} from 'graphql';

import ShowListingType from './ShowListingType';

import { Listing } from '../models'

const WishListTypeData = new ObjectType({
    name: 'WishListTypeData',
    fields: {
        wishListGroupId: { type: IntType },
        listId: { type: IntType },
        eventkeyValue: { type: BooleanType }
    }
});

const WishListType = new ObjectType({
    name: 'WishList',
    fields: {
        id: { type: IntType },
        wishListGroupId: { type: IntType },
        eventkey: { type: BooleanType },
        listId: { type: IntType },
        results: { type: WishListTypeData },
        userId: { type: new NonNull(ID) },
        createdAt: { type: StringType },
        updatedAt: { type: StringType },
        status: { type: IntType },
        errorMessage: { type: StringType },
        listData: {
            type: ShowListingType,
            async resolve(listing) {
                return await Listing.findOne({
                    where: {
                        isPublished: true,
                        id: listing.listId
                    }
                });
            }
        },
        count: {
            type: IntType
        },
        isListActive: { type: BooleanType}
    }
});

export default WishListType;