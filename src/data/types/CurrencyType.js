import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLList as List,
} from 'graphql';

import AllRatesType from './AllRatesType';

const CurrencyType = new ObjectType({
    name: 'Currency',
    fields: {
        base: { type: StringType },
        date: { type: StringType },
        // rates: { type: new List(AllRatesType) },
        rates: { type: StringType },
        status: { type: IntType },
        errorMessage: {
            type: StringType
        },
        result: {
            type: AllRatesType
        },
    },
});

export default CurrencyType;
