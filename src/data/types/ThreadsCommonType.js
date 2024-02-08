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

import ThreadsType from './ThreadsType';
import ThreadItemsType from './ThreadItemsType';
import ProfileType from './ProfileType';
import UserType from './UserType';

import { UserProfile, User } from '../models'

const ThreadsCommonType = new ObjectType({
    name: 'ThreadsCommon',
    fields: {
        results: { 
            type: ThreadsType
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        },
        threadItems: {
            type: new List(ThreadItemsType)
        },
        hostProfile: {
            type: ProfileType,
            resolve(threads) {
                if(threads && threads.results){
                    return UserProfile.findOne({ where: { userId: threads.results['host'] } });
                }
            }
        },
        guestProfile: {
            type: ProfileType,
            resolve(threads) {
                if(threads && threads.results){
                    return UserProfile.findOne({ where: { userId: threads.results['guest'] } });
                }
            }
        },
    }
});

export default ThreadsCommonType;
