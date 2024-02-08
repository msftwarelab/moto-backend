import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLList as List,
    GraphQLBoolean as BooleanType
} from 'graphql';
import ShowListingType from '../types/ShowListingType';

const WholeManageListingsType = new ObjectType({
    name: 'WholeManageListingsType',
    fields: {
        results: {
            type: new List(ShowListingType),
        },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default WholeManageListingsType;
