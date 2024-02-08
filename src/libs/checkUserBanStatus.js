import { User } from '../data/models';

export default async function checkUserBanStatus(id) {
    let userStatusErrorMessage, userStatusError;
    const userStatus = await User.findOne({
        attributes: ['id', 'userBanStatus', 'userDeletedAt'],
        where: {
            id
        },
        raw: true
    });

    if (userStatus && userStatus.userBanStatus) {
        userStatusErrorMessage = 'Oops! It looks like your account is disabled at the moment. Please contact our support.';
        userStatusError = 500;
    } else if (userStatus && userStatus.userDeletedAt) {
        userStatusErrorMessage = 'Oops! We are unable to find your account. Please contact support for help.';
        userStatusError = 500;
    }

    return await {
        userBanStatus: userStatus && userStatus.userBanStatus,
        userDeletedAt: userStatus && userStatus.userDeletedAt,
        userStatusErrorMessage,
        userStatusError
    };
}