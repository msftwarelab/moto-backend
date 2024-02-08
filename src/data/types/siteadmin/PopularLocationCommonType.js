import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLList as List
} from 'graphql';
import PopularLocationType from './PopularLocationType';

const PopularLocationCommonType = new ObjectType({
    name: 'PopularLocationCommonType',
    fields: {
        status: {
            type: IntType
        },
        errorMessage: {
            type: StringType
        },
        result: {
            type: PopularLocationType
        },
        results: {
            type: new List(PopularLocationType)
        },
    }
});

export default PopularLocationCommonType;