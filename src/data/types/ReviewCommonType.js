import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType,
    GraphQLList as List,
} from 'graphql';
import moment from 'moment';
// Models

import ReviewsType from './ReviewsType';


const ReviewCommonType = new ObjectType({
    name: 'Reviewlist',
    fields: {
        results: { 
            type: new List(ReviewsType)
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        },
        count: {
            type: IntType
        },
        currentPage: {
            type: IntType
        },
        ownerType: {
            type: StringType
        },
    }
});

export default ReviewCommonType;
