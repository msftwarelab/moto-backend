import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType
} from 'graphql';

import UserVerifiedInfoType from './UserVerifiedInfoType';
import UserProfileType from './UserProfileType';

import { UserVerifiedInfo, User } from '../models';

const UserEditProfile = new ObjectType({
  name: 'userEditProfile',
  fields: {
    userId: { type: ID },
    firstName: { type: StringType },
    lastName: { type: StringType },
    gender: { type: StringType },
    dateOfBirth: { type: StringType },
    email: { type: StringType },
    phoneNumber: { type: StringType },
    preferredLanguage: { type: StringType },
    preferredCurrency: { type: StringType },
    location: { type: StringType },
    info: { type: StringType },
    status: { type: StringType },
    country: { type: IntType },
    verificationCode: { type: IntType },
    picture: {
      type: StringType,
    },
    createdAt: {
      type: StringType
    },
    verification: {
      type: UserVerifiedInfoType,
      async resolve(userProfile) {
        return await UserVerifiedInfo.findOne({ where: { userId: userProfile.userId } });
      }
    },
    userData: {
      type: UserProfileType,
      resolve(profile) {
        return User.findOne({
          where: { id: profile.userId },
        });
      },
    },
    displayName: {
      type: StringType,
    },
    countryCode: { type: StringType },
  },
});

export default UserEditProfile;
