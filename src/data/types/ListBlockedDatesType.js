import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType,
    GraphQLNonNull as NonNull,
    GraphQLList as List,
} from 'graphql';

import { ListingData } from '../models';

const ListBlockedDates = new ObjectType({
    name: 'ListBlockedDates',
    fields: {
        id: { type: IntType },
        listId: { type: IntType },
        reservationId: { type: IntType },
        calendarId: { type: IntType },
        blockedDates: { type: StringType },
        status: { type: IntType },
        errorMessage: { type: StringType },
        calendarStatus: { type: StringType },
        isSpecialPrice: { type: FloatType },
        listCurrency: {
            type: StringType,
            async resolve(listing, { }, request) {
                let listingData = await ListingData.findOne({
                    attributes: ['currency'],
                    where: {
                        listId: listing.listId
                    },
                    raw: true
                });
                return (listingData && listingData.currency);
            }
        }
    }
});

const ListBlockedDatesResponseType = new ObjectType({
    name: 'ListBlockedDatesResponseType',
    fields: {
        results: {
            type: new List(ListBlockedDates)
        },
        status: {
            type: IntType
        },
        errorMessage: {
            type: StringType
        }
    }
});

export default ListBlockedDatesResponseType;

