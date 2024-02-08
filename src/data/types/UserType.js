import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType
} from 'graphql';
import { UserProfile, UserVerifiedInfo, User } from '../models';

import UserEditProfile from './userEditProfileType';

const UserType = new ObjectType({
  name: 'UserType',
  fields: {
    id: { type: new NonNull(ID) },
    email: { type: StringType },
    emailConfirmed: { type: BooleanType },
    type: { type: StringType },
    userBanStatus: { type: IntType },
    status: { type: IntType },
    errorMessage: { type: StringType },
    userId: { type: StringType },
    userToken: { type: StringType },
    forgotLink: { type: StringType },
    firstName: { type: StringType },
    lastName: { type: StringType },
    gender: { type: StringType },
    dateOfBirth: { type: StringType },
    // type: { StringType },
    user: {
      type: UserEditProfile,
      async resolve(user) {
        return await UserProfile.findOne({
          where: {
            userId: user.userId
          }
        })
      }
    },

  },
});

export default UserType;
