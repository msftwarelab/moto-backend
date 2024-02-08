import SocialVerificationType from '../../types/SocialVerificationType';
import { UserVerifiedInfo } from '../../models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const SocialVerification = {

    type: SocialVerificationType,

    args: {
        verificationType: { type: new NonNull(StringType) },
        actionType: { type: new NonNull(StringType) }
    },

    async resolve({ request }, {
        verificationType,
        actionType
    }) {


        try {

            if (request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                let published;

                if (verificationType == 'google') {
                    const updatePhoneVerified = await UserVerifiedInfo.update({
                        isGoogleConnected: actionType
                    }, {
                        where: {
                            userId: request.user.id
                        }
                    }).spread(function (instance) {
                        // Check if any rows are affected
                        if (instance > 0) {
                            published = true;
                        }
                    });
                }

                if (verificationType == 'facebook') {
                    const updatePhoneVerified = await UserVerifiedInfo.update({
                        isFacebookConnected: actionType
                    }, {
                        where: {
                            userId: request.user.id
                        }
                    }).spread(function (instance) {
                        // Check if any rows are affected
                        if (instance > 0) {
                            published = true;
                        }
                    });
                }

                if (published) {
                    return {
                        status: 200,
                        errorMessage: "success"
                    };
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Something went wrong.'
                    };
                }


            } else {
                return {
                    status: 500,
                    errorMessage: 'You are not Logged In'
                }
            }
        } catch (error) {
            return {
                status: 400,
                errorMessage: 'Something went wrong.'
            }
        }
    },
};

export default SocialVerification;

/**
mutation SocialVerification($verificationType: String!, $actionType: String!) {
    SocialVerification(verificationType: $verificationType, actionType: $actionType ) {
        status
    }
}
 */
