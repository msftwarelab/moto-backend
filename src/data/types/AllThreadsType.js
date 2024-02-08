import {
    GraphQLObjectType as ObjectType,
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ThreadsType from './ThreadsType';

const AllThreadsType = new ObjectType({
	name: 'AllThreads',
	fields: {
		results: {
			type: new List(ThreadsType)
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

export default AllThreadsType;