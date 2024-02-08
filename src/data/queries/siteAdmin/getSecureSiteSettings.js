import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import { SiteSettings } from '../../../data/models';
import SiteSettingsCommonType from '../../types/siteadmin/SiteSettingsType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getSecureSiteSettings = {

    type: SiteSettingsCommonType,

    args: {
        settingsType: { type: StringType },
        securityKey: { type: NonNull(StringType) },
    },

    async resolve({ request }, { settingsType, securityKey }) {

        try {

            let where = {
                name: {
                    $ne: 'platformSecretKey'
                },
            };

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            const getPlatformSecretKey = await SiteSettings.findOne({
                attributes: ['value'],
                where: {
                    name: 'platformSecretKey'
                }
            });

            if (securityKey != getPlatformSecretKey.value) return {
                status: 400,
                errorMessage: 'Oops! Something went wrong. Please provide valid credentials.'
            }

            if (settingsType != null) {
                where = {
                    type: {
                        $in: [settingsType, 'site_settings', 'appSettings', 'config_settings']
                    },
                    name: {
                        $ne: 'platformSecretKey'
                    },
                }
            }

            // Get Specific Type of Settings Data
            const results = await SiteSettings.findAll({
                attributes: [
                    'id',
                    'title',
                    'name',
                    'value',
                    'type'
                ],
                where
            });


            return {
                status: 200,
                results
            };

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }

    },
};

export default getSecureSiteSettings;
