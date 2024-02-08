import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLList as List
} from 'graphql';

const UnReadCount = new ObjectType({
    name: 'UnReadCount',
    fields: {
        ownerCount: {
            type: IntType
        },
        renterCount: {
            type: IntType
        },
        total: {
            type: IntType
        },
        userBanStatus: {
            type: IntType
        },
        isUnReadMessage: {
            type: BooleanType
        },
        messageCount: {
            type: IntType
        }
    },
  });

const UnReadCountType = new ObjectType({
    name: 'UnreadThreadsCount',
    fields: {
        results: { 
            type: UnReadCount
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        }
    }
});

export default UnReadCountType;