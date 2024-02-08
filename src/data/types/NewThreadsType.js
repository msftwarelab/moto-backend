import {
    GraphQLObjectType as ObjectType,
    GraphQLList as List,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
} from 'graphql';

import ThreadItemsType from './ThreadItemsType';
import ProfileType from './ProfileType';


const NewThreadsType = new ObjectType({
    name: 'NewThreadsType',
    fields: {
        listId: {
            type: IntType,
        },
        guest: {
            type: StringType,
        },
        threadItems: {
            type: new List(ThreadItemsType)
        },
        hostProfile: {
            type: ProfileType,
        },
        guestProfile: {
            type: ProfileType,
        },
        getThreadCount: {
            type: IntType,
        },
        threadItemForType: {
            type: ThreadItemsType
        },
    }
});

export default NewThreadsType;
