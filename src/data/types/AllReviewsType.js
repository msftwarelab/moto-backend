import {
    GraphQLObjectType as ObjectType,
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ReviewsType from './ReviewsType';

const AllReviewsType = new ObjectType({
	name: 'AllReview',
	fields: {
		results: {
			type: new List(ReviewsType)
		},
		count: {
			type: IntType
		},
		status: {
			type: IntType
		}
	}
});

export default AllReviewsType;