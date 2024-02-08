import ReportUserCommonType from '../../types/ReportUserCommonType';
import { ReportUser, UserProfile, User, SiteSettings } from '../../../data/models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLObjectType as ObjectType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';
import { sendEmail } from '../../../libs/sendEmail';

const CreateReportUser = {

    type: ReportUserCommonType,

    args: {
        reporterId: { type: StringType },
        userId: { type: StringType },
        reportType: { type: StringType },
        profileId: { type: IntType },
        reporterName: { type: StringType }
    },

    async resolve({ request }, {
        reporterId,
        reportType,
        profileId,
        userId,
        reporterName
    }) {

        try {

            let content;
            const checkUser = await User.findOne({
                where: {
                    id: reporterId,
                    $or: [
                        {
                            userBanStatus: 0
                        },
                        {
                            userBanStatus: null
                        }
                    ]
                }
            });

            if (checkUser) {
                const getUser = await UserProfile.findOne({
                    attributes: ['userId', 'firstName'],
                    where: {
                        profileId
                    }
                });

                const adminEmail = await SiteSettings.findOne({
                    attributes: ['value'],
                    where: {
                        name: 'email'
                    },
                    raw: true
                });

                userId = getUser && getUser.userId;
                content = {
                    userName: getUser && getUser.firstName,
                    reporterName,
                    reportType,
                    defaultContent:true
                };

                if (request.user && !request.user.admin == true) {

                    const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                    if (userStatusErrorMessage) {
                        return {
                            status: userStatusError,
                            errorMessage: userStatusErrorMessage
                        };
                    }

                    const createReport = await ReportUser.create({
                        reporterId: reporterId,
                        userId: userId,
                        reportType: reportType,
                    })

                    const { status, errorMessage } = await sendEmail(adminEmail.value, 'reportUser', content);

                    return {
                        status: 200,
                    }
                } else {
                    return {
                        status: 500,
                        errorMessage: "You are not LoggedIn"
                    }
                }
            }
            else {
                return {
                    status: 500,
                    errorMessage: "Invalid reporterId.Banned User"
                }

            }


        } catch (error) {
            return {
                errorMessage: 'Something went wrong! ' + error,
                status: 400
            }
        }

    },
};

export default CreateReportUser;
