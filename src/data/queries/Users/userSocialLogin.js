// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

// Models
import {
    User,
    UserLogin,
    UserProfile,
    UserVerifiedInfo,
    EmailToken
} from '../../models';

// Types
import UserType from '../../types/UserType';
import UserCommonType from '../../types/UserCommonType';

// Helpers
import { capitalizeFirstLetter } from '../../../helpers/capitalizeFirstLetter';
import { createJWToken } from '../../../libs/auth';
import { sendEmail } from '../../../libs/sendEmail';
import { downloadFile } from '../../../libs/download';

const userSocialLogin = {
    type: UserCommonType,

    args: {
        firstName: { type: StringType },
        lastName: { type: StringType },
        email: { type: new NonNull(StringType) },
        dateOfBirth: { type: StringType },
        deviceType: { type: new NonNull(StringType) },
        deviceDetail: { type: StringType },
        deviceId: { type: new NonNull(StringType) },
        registerType: { type: StringType },
        gender: { type: StringType },
        profilePicture: { type: StringType }
    },

    async resolve({ request, response }, {
        firstName,
        lastName,
        email,
        dateOfBirth,
        deviceType,
        deviceDetail,
        deviceId,
        registerType,
        gender,
        profilePicture
    }) {
        let signUpType = (registerType) ? registerType : 'email';
        let updatedFirstName = firstName ? capitalizeFirstLetter(firstName) : '';
        let updatedLastName = lastName ? capitalizeFirstLetter(lastName) : '';
        let displayName = updatedFirstName + ' ' + updatedLastName;
        let userToken, where, deviceLoginExist;
        let userVerifiedType = registerType === 'google' ? 'isGoogleConnected' : 'isFacebookConnected';
        let random = Date.now(), picture = null;
        let pictureURL, pictureData;

        try {
            if (!request.user) {
                // Check if the user is already exists
                const checkUser = await User.findOne({
                    attributes: ['id', 'email', 'type', 'userBanStatus'],
                    where: {
                        email,
                        userDeletedAt: {
                            $eq: null
                        },
                    },
                    order: [
                        [`createdAt`, `DESC`],
                    ],
                    raw: true
                });

                if (checkUser) { // Login                     
                    // Validate Is user banned
                    if (checkUser.userBanStatus == 1) {
                        return {
                            errorMessage: 'Your account has blocked for some reason. If you need further information, please contact us.',
                            status: 500
                        };
                    } else {
                        if (checkUser && checkUser.type === signUpType) {
                            userToken = await createJWToken(checkUser.id, checkUser.email);
                            where = {
                                userId: checkUser.id,
                                deviceId,
                                deviceType
                            };

                            const updateUserVerified = await UserVerifiedInfo.update({
                                [userVerifiedType]: true
                            }, {
                                where: { userId: checkUser.id },
                            });

                            deviceLoginExist = await UserLogin.findOne({
                                where
                            });

                            if (deviceLoginExist) {
                                // update login token record with device infomation
                                const updateUserLogin = await UserLogin.update({
                                    key: userToken,
                                    userId: checkUser.id,
                                    deviceType,
                                    deviceDetail,
                                    deviceId
                                }, {
                                    where
                                });
                            } else {
                                // Insert login token record with device infomation
                                const creatUserLogin = await UserLogin.create({
                                    key: userToken,
                                    userId: checkUser.id,
                                    deviceType,
                                    deviceDetail,
                                    deviceId
                                });
                            }

                            let user = await UserProfile.findOne({
                                where: {
                                    userId: checkUser.id,
                                },
                                raw: true
                            });

                            return {
                                result: {
                                    email: email,
                                    userId: checkUser.id,
                                    userToken
                                },
                                status: 200,
                                // user
                            };
                        } else {
                            return {
                                errorMessage: 'Oops! It seems the email is already in use. Please try with a different account.',
                                status: 400
                            };
                        }
                    }
                } else { // Sign up
                    // Downloading profile picture from social website
                    if (profilePicture) {
                        pictureURL = profilePicture;
                        pictureData = await downloadFile(profilePicture);
                        if (pictureData && pictureData.status === 200) {
                            picture = pictureData.filename;
                        }
                    }

                    const newUser = await User.create({
                        email,
                        emailConfirmed: true,
                        password: User.prototype.generateHash(random.toString()),
                        type: signUpType,
                        profile: {
                            displayName,
                            firstName: updatedFirstName,
                            lastName: updatedLastName,
                            dateOfBirth,
                            gender,
                            picture,
                        },
                        userVerifiedInfo: {
                            [userVerifiedType]: true
                        },
                        emailToken: {
                            token: random,
                            email
                        }
                    }, {
                        include: [
                            { model: UserProfile, as: 'profile' },
                            { model: UserVerifiedInfo, as: 'userVerifiedInfo' },
                            { model: EmailToken, as: 'emailToken' },
                        ],
                    });

                    if (newUser) {

                        const isUser = await User.findOne({
                            attributes: ['id', 'email', 'type', 'userBanStatus'],
                            where: {
                                email,
                                userDeletedAt: {
                                    $eq: null
                                },
                            },
                            order: [
                                [`createdAt`, `DESC`],
                            ],
                            raw: true
                        });


                        userToken = await createJWToken(newUser.id, newUser.email);

                        // Insert login token record with device infomation
                        const creatUserLogin = await UserLogin.create({
                            key: userToken,
                            userId: newUser.id,
                            deviceType,
                            deviceDetail,
                            deviceId
                        });

                        let content = {
                            token: random,
                            name: firstName,
                            email: newUser.email
                        };

                        let user = await UserProfile.findOne({
                            where: {
                                userId: isUser.id,
                            },
                            raw: true
                        });

                        const { status, errorMessage } = await sendEmail(newUser.email, 'welcomeEmail', content);
                        return {
                            result: {
                                email: newUser.email,
                                userId: newUser.id,
                                userToken,
                                user
                            },
                            status: 200,
                        };
                    } else {
                        return {
                            errorMessage: 'Something went wrong',
                            status: 400
                        }
                    }
                    return {
                        status: 200
                    }
                }
            } else {
                return {
                    errorMessage: 'You have already logged in.',
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

export default userSocialLogin;

/*

query (
    $firstName: String,
    $lastName: String,
    $email: String!,
    $dateOfBirth: String,
    $deviceType: String!,
    $deviceDetail: String,
    $deviceId: String!,
    $registerType: String,
    $gender: String,
    $profilePicture: String
) {
    userSocialLogin (
        firstName: $firstName,
        lastName: $lastName,
        email: $email,
        dateOfBirth: $dateOfBirth,
        deviceType: $deviceType,
        deviceDetail: $deviceDetail,
        deviceId: $deviceId,
        registerType: $registerType,
        gender: $gender,
        profilePicture: $profilePicture
    ) {
        userId
        userToken
        status
        errorMessage
    }
}

*/