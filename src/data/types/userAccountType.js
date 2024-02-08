import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType
} from 'graphql';

import UserVerifiedInfoType from './UserVerifiedInfoType';
import UserType from './UserType';

import { UserVerifiedInfo, User, Listing } from '../models';

const UserAccountType = new ObjectType({
  name: 'UserAccount',
  fields: {
    userId: { type: ID },
    profileId: { type: IntType },
    firstName: { type: StringType },
    lastName: { type: StringType },
    displayName: { type: StringType },
    gender: { type: StringType },
    dateOfBirth: { type: StringType },
    iosDOB:{
      type: StringType,
      async resolve(account) {
        var array = account.dateOfBirth.split("-");
        return array[0] + '-' + array[2] + '-' + array[1];
      }
    },
    email: { type: StringType },
    userBanStatus: { type: IntType },
    phoneNumber: { type: StringType },
    preferredLanguage: { type: StringType },
    preferredLanguageName: { type: StringType },
    preferredCurrency: { type: StringType },
    location: { type: StringType },
    info: { type: StringType },
    createdAt: { type: StringType },
    userDeletedAt: { type: StringType },
    status: { type: StringType },
    picture: { type: StringType },
    verification: {
      type: UserVerifiedInfoType,
      async resolve(userProfile) {
        return await UserVerifiedInfo.findOne({ where: { userId: userProfile.userId } });
      }
    },
    userData: {
      type: UserType,
      async resolve(userProfile) {
        return await User.findOne({ where: { id: userProfile.userId } });
      }
    },
    country: { type: IntType },
    verificationCode: { type: IntType },
    countryCode: { type: StringType },
    status: { type: IntType },
    errorMessage: { type: StringType },
    loginUserType: {
      type: StringType,
      async resolve(userProfile, { }, request) {
        let userId = (request && request.user) ? request.user.id : undefined;
        let count = await Listing.count({
          where: {
            userId
          },
        });
        return (count) ? 'Host' : 'Guest';
      }
    },
    isAddedList: {
      type: BooleanType,
      async resolve(userProfile, { }, request) {
        let userId = (request && request.user) ? request.user.id : undefined;
        let count = await Listing.count({
          where: {
            userId
          },
        });
        return (count) ? true : false;
      }
    },
    phoneNumberStatus:{ type: StringType }
  },
});

export default UserAccountType;
