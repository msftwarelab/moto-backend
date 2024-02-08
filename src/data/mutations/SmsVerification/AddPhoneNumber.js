import twilio from 'twilio';
import moment from 'moment';
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import { UserProfile, UserVerifiedInfo, SiteSettings } from '../../models';
import UserAccountType from '../../types/userAccountType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';
import { getConfigurationData } from '../../../libs/getConfigurationData'


const AddPhoneNumber = {

    type: UserAccountType,

    args: {
        countryCode: { type: new NonNull(StringType) },
        phoneNumber: { type: new NonNull(StringType) },
    },

    async resolve({ request }, {
        countryCode,
        phoneNumber
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

                const twillioData = await getConfigurationData({ name: ['twillioAccountSid', 'twillioAuthToken', 'twillioPhone'] });
                const client = new twilio(twillioData.twillioAccountSid, twillioData.twillioAuthToken);

                let sitename, phoneNumberStatus, status = false, verificationCode = Math.floor(1000 + Math.random() * 9000), sendSms = true;
                let userId = request.user.id;
                let today = moment();

                const getSiteSettings = await SiteSettings.findAll({
                    attributes: ['name', 'value'],
                    where: {
                        name: {
                            $in: ['siteName', 'phoneNumberStatus']
                        }
                    },
                    raw: true
                });

                phoneNumberStatus = getSiteSettings && getSiteSettings.find((o) => o.name === 'phoneNumberStatus');
                sitename = getSiteSettings && getSiteSettings.find((o) => o.name === 'siteName');
                sitename = sitename.value;
                phoneNumberStatus = phoneNumberStatus.value;

                if (phoneNumberStatus == '1') {

                    let message = sitename + ' security code: ' + verificationCode;
                    message += '. Use this to finish your verification.';
                    let convertedNumber = countryCode + phoneNumber;
                    const isPhoneVerification = await UserVerifiedInfo.update({
                        isPhoneVerified: false
                    },
                        {
                            where: {
                                userId
                            }
                        }
                    );

                    let findUpdatedTime = await UserProfile.findOne({
                        attributes: ['codeUpdatedAt', 'phoneNumber', 'countryCode'],
                        where: {
                            userId
                        },
                        raw: true
                    });


                    if (findUpdatedTime && findUpdatedTime.codeUpdatedAt != null) {
                        let codeUpdatedAt = moment(findUpdatedTime.codeUpdatedAt);
                        let userProfileNumber = findUpdatedTime.countryCode + findUpdatedTime.phoneNumber;

                        let timeDiff = today.diff(codeUpdatedAt, 'minutes');
                        if (timeDiff < 2 && userProfileNumber == convertedNumber) {
                            sendSms = false;
                        }
                    }

                    if (sendSms) {
                        const publish = await UserProfile.update({
                            countryCode: countryCode,
                            phoneNumber: phoneNumber,
                            verificationCode: verificationCode,
                            codeUpdatedAt: new Date()
                        }, {
                            where: {
                                userId
                            }
                        });


                        let responseData = await client.messages
                            .create({
                                body: message,
                                from: twillioData.twillioPhone,
                                to: convertedNumber
                            });

                        status = true;
                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Please try again after 2 minutes to receive a new OTP.'
                        }
                    }

                } else {
                    const isPhoneVerified = await UserVerifiedInfo.update({
                        isPhoneVerified: true
                    },
                        {
                            where: {
                                userId
                            }
                        }
                    );

                    const updateProfile = await UserProfile.update({
                        countryCode: countryCode,
                        phoneNumber: phoneNumber
                    }, {
                        where: {
                            userId
                        }
                    });

                    status = true;
                }
                if (status) {
                    return {
                        status: 200,
                        countryCode,
                        phoneNumber,
                        phoneNumberStatus
                    };
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Something went wrong.'
                    }
                }

            } else {

                return {
                    status: 500,
                    errorMessage: 'You are not LoggedIn'
                };
            }
        } catch (error) {

            return {
                status: 400,
                errorMessage: error.message

            }
        }
    },
};

export default AddPhoneNumber;

/**
mutation AddPhoneNumber($countryCode: String!, $phoneNumber: String!) {
    AddPhoneNumber(countryCode: $countryCode, phoneNumber: $phoneNumber) {
        status
    }
}
 */
