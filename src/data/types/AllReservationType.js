import {
    GraphQLObjectType as ObjectType,
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ReservationType from './ReservationType';

const AllReservationType = new ObjectType({
	name: 'AllReservation',
	fields: {
		reservationData: {
			type: new List(ReservationType)
		},
		result: {
			type: new List(ReservationType)
		},
		results: {
			type: new List(ReservationType)
		},
		currentPage: {
			type: IntType
		},
		count: {
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

export default AllReservationType;