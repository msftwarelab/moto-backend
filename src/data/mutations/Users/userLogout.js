// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

// Models
import { UserLogin } from '../../models';

// Types
import UserType from '../../types/UserType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const userLogout = {
    type: UserType,

    args: {
        deviceType: { type: new NonNull(StringType) },
        deviceId: { type: new NonNull(StringType) },
    },

    async resolve({ request, response }, {
        deviceType,
        deviceId
    }) {
        let where;

        try {
            if (request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                const userId = request.user.id;
                where = {
                    userId,
                    deviceType,
                    deviceId
                };

                const checkLogin = await UserLogin.findOne({
                    attributes: ['id'],
                    where
                });

                if (checkLogin) {
                    const removeLogin = await UserLogin.destroy({
                        where
                    });

                    return {
                        status: 200
                    };
                } else {
                    return {
                        errorMessage: "You haven't logged in.",
                        status: 500
                    };
                }
            } else {
                return {
                    errorMessage: 'You have already logged out.',
                    status: 400
                };
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong.' + error,
                status: 400
            }
        }
    }
};

export default userLogout;

/*

mutation (
    $deviceType: String!,
    $deviceId: String!) {
    userLogout (
        deviceType: $deviceType,        
        deviceId: $deviceId,
    ) {
        status
        errorMessage
    }
}

*/