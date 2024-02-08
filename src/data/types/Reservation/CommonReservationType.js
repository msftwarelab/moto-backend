import {
    GraphQLObjectType as ObjectType,
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ReservationType from '../ReservationType';

const CommonReservationType = new ObjectType({
	name: 'CommonReservationType',
	fields: {
		result: {
			type: ReservationType
		},
		results: {
			type: new List(ReservationType)
		},
		count: {
			type: IntType
		},
		currentPage: {
			type: IntType
		},
		status: {
			type: IntType
		},
		errorMessage: { 
            type: StringType 
        }
	}
});

export default CommonReservationType;