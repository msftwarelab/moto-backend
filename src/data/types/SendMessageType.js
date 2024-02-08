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

import ThreadItemsType from './ThreadItemsType';

const SendMessageType = new ObjectType({
    name: 'SendMessage',
    fields: {
        results: { 
            type: ThreadItemsType
        },
        status: { 
            type: IntType 
        },
        message: { 
            type: StringType 
        },
        errorMessage: { 
            type: StringType 
        },
        actionType: { 
            type: StringType 
        },
    }
});

export default SendMessageType;
