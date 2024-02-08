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

import NewThreadsType from './NewThreadsType';


import { UserProfile, User } from '../models'

const NewThreadsCommonType = new ObjectType({
    name: 'NewThreadsCommonType',
    fields: {
        results: { 
            type: NewThreadsType
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        },
    }
});

export default NewThreadsCommonType;
