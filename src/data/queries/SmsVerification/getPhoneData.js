import UserAccountType from '../../types/userAccountType';
import { User, UserProfile } from '../../models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getPhoneData = {

    type: UserAccountType,

    async resolve({ request, response }) {

        let currentToken, errorMessage;

        try {

            if (request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                currentToken = request.headers.auth;

                const userProfile = await UserProfile.findOne({
                    where: {
                        userId: request.user.id,
                        //key: currentToken
                    }
                });

                const userEmail = await User.findOne({
                    attributes: [
                        'email'
                    ],
                    where: { id: request.user.id }
                })

                if (userProfile && userEmail) {
                    return {
                        userId: request.user.id,
                        profileId: userProfile.dataValues.profileId,
                        phoneNumber: userProfile.dataValues.phoneNumber,
                        country: userProfile.dataValues.country,
                        countryCode: userProfile.dataValues.countryCode,
                        verificationCode: userProfile.dataValues.verificationCode,
                        status: 200
                    }
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Something went wrong'
                    }
                }
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong.' + error,
                status: 400
            }
        }
    },
};

export default getPhoneData;
