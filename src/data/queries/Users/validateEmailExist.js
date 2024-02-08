// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

// Models
import { User, AdminUser } from '../../models';

// Types
import CommonType from '../../types/CommonType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const validateEmailExist = {
    type: CommonType,

    args: {
        email: {
            type: new NonNull(StringType)
        }
    },

    async resolve({ request, response }, {
        email
    }) {

        if (request && request.user) {
            const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
            if (userStatusErrorMessage) {
                return {
                    status: userStatusError,
                    errorMessage: userStatusErrorMessage
                };
            }
        }

        const checkUser = await User.findOne({
            attributes: ['id', 'email'],
            where: {
                email,
                userDeletedAt: {
                    $eq: null
                },
            },
            order: [
                [`createdAt`, `DESC`],
            ],
        });

        try {
            if (checkUser) {
                return {
                    errorMessage: 'User already Exists',
                    status: 400
                };
            } else {
                const getAdminUserId = await AdminUser.findOne({
                    where: {
                        email
                    },
                });

                if (getAdminUserId) {
                    return {
                        errorMessage: 'User already Exists',
                        status: 400
                    };
                } else {
                    return {
                        status: 200
                    };
                }
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong',
                status: 400
            }
        }
    }

};

export default validateEmailExist;

/*

query ($email: String!) {
    validateEmailExist (email: $email) {
        status
    }
}

*/