import { PopularLocation } from '../../models';
import PopularLocationCommonType from '../../types/siteadmin/PopularLocationCommonType';
import sequelize from '../../sequelize';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getPopularLocations = {

    type: PopularLocationCommonType,

    async resolve({ request }) {

        try {

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            const results = await PopularLocation.findAll({
                attributes: ['id', 'location', 'locationAddress', 'image'],
                where: {
                    isEnable: true
                },
                order: [[sequelize.literal('RAND()')]],
            });

            return {
                results,
                status: results ? 200 : 400,
                errorMessage: results ? null : 'Oops! Something went wrong fetching records.'
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }

    }
};

export default getPopularLocations;