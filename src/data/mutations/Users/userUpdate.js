// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

// Models
import { UserLogin, UserProfile, User, AdminUser } from '../../models';

// Types
import UserType from '../../types/UserType';

import { createJWToken } from '../../../libs/auth';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const userUpdate = {
    type: UserType,

    args: {
        userId: { type: new NonNull(StringType) },
        fieldName: { type: new NonNull(StringType) },
        fieldValue: { type: StringType },
        deviceType: { type: new NonNull(StringType) },
        deviceId: { type: new NonNull(StringType) },
    },

    async resolve({ request, response }, {
        userId,
        fieldName,
        fieldValue,
        deviceType,
        deviceId
    }) {
        let where, status = 200, errorMessage, convertedName, displayName;
        let userToken, currentToken;

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

                where = {
                    userId,
                    deviceType,
                    deviceId,
                    key: currentToken
                };

                const checkLogin = await UserLogin.findOne({
                    attributes: ['id'],
                    where
                });

                if (checkLogin && request.user.id === userId) {
                    if (fieldName === 'email') { // If email field
                        if (request.user.email !== fieldValue) { // If new email
                            // Find If already have same
                            const getUserExist = await User.findOne({
                                attributes: ['id'],
                                where: {
                                    email: fieldValue,
                                    $not: {
                                        id: userId
                                    },
                                    userDeletedAt: {
                                        $eq: null
                                    },
                                }
                            });

                            if (getUserExist) {
                                status = 400;
                                errorMessage = 'Email already exist, please try another email address!'
                            } else {
                                const getAdminExist = await AdminUser.findOne({
                                    attributes: ['id'],
                                    where: { email: fieldValue }
                                });

                                if (getAdminExist) {
                                    status = 400;
                                    errorMessage = 'Email already exist, please try another email address!'
                                } else {
                                    const userEmailUpdate = await User.update({
                                        email: fieldValue
                                    }, {
                                        where: {
                                            id: userId
                                        }
                                    });

                                    // New Token
                                    userToken = await createJWToken(userId, fieldValue);

                                    await UserLogin.update({
                                        key: userToken
                                    }, {
                                        where
                                    });
                                }
                            }
                        }
                    } else if (fieldName === 'firstName') { // If first & last name fields
                        convertedName = JSON.parse(fieldValue);
                        if (convertedName && convertedName.length === 2) {
                            displayName = convertedName[0] + ' ' + convertedName[1];

                            const updateName = await UserProfile.update(
                                {
                                    firstName: convertedName[0],
                                    lastName: convertedName[1],
                                    displayName
                                },
                                {
                                    where: {
                                        userId: request.user.id
                                    }
                                }
                            );

                            if (updateName) {
                                status = 200;
                            } else {
                                status = 400,
                                    errorMessage = 'First name and last name values are unable to update'
                            }
                        } else {
                            status = 400;
                            errorMessage = 'First name and last name are required.'
                        }
                    } else { // Other fields
                        const updateUser = await UserProfile.update(
                            {
                                [fieldName]: fieldValue
                            },
                            {
                                where: {
                                    userId: request.user.id
                                }
                            }
                        );

                        if (updateUser) {
                            status = 200;
                        } else {
                            status = 400,
                                errorMessage = fieldName + ' value unable to update'
                        }
                    }

                    return await {
                        status,
                        errorMessage,
                        userToken
                    };
                } else {
                    return {
                        errorMessage: "You haven't authorized for this action.",
                        status: 500,
                        userToken
                    };
                }
            } else {
                return {
                    errorMessage: "Please login for this action.",
                    status: 500,
                    userToken
                };
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong.' + error,
                status: 400,
                userToken
            }
        }
    }
};

export default userUpdate;

/*

mutation (
    $userId: String!, 
    $fieldName: String!,
    $fieldValue: String,
    $deviceType: String!,
    $deviceId: String!) {
    userUpdate (
        userId: $userId,
        fieldName: $fieldName,
        fieldValue: $fieldValue,
        deviceType: $deviceType,        
        deviceId: $deviceId,
    ) {
        status
        errorMessage
        userToken
    }
}

*/