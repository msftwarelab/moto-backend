import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLList as List,
} from 'graphql';

import CurrenciesType from './CurrenciesType';

const AllCurrenciesType = new ObjectType({
    name: 'AllCurrenciesType',
    fields: {
        results: { 
            type: new List(CurrenciesType)
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        }
    },
});

export default AllCurrenciesType;