import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull
} from 'graphql';
import { SiteSettings } from '../../models';
import SiteSettingsCommonType from '../../types/siteadmin/SiteSettingsType';

import { versionCompare } from '../../../helpers/formatNumbers';


const getApplicationVersionInfo = {

    type: SiteSettingsCommonType,

    args: {
        appType: { type: new NonNull(StringType) },
        version: { type: new NonNull(StringType) },
    },

    async resolve({ request }, { appType, version }) {
        try {
            let status = 200, errorMessage, appForceUpdate, appVersion, appVersionCompare, appStoreUrl, playStoreUrl;
            const getSiteSettings = await SiteSettings.findAll({
                attributes: ['name', 'value'],
                where: {
                    name: {
                        $in: ['appForceUpdate', appType, 'playStoreUrl', 'appStoreUrl']
                    }
                },
                raw: true
            });

            appForceUpdate = getSiteSettings && getSiteSettings.find((o) => o.name === 'appForceUpdate').value;
            appVersion = getSiteSettings && getSiteSettings.find((o) => o.name == appType).value;
            appStoreUrl = getSiteSettings && getSiteSettings.find((o) => o.name === 'appStoreUrl').value;
            playStoreUrl = getSiteSettings && getSiteSettings.find((o) => o.name === 'playStoreUrl').value;
            appVersionCompare = versionCompare(version, appVersion);

            if (appForceUpdate === 'true' && appVersionCompare && appVersionCompare.forceUpdate) {
                status = 400;
                errorMessage = 'The using application version is no longer supported. Please upgrade to a newer version.';
            }

            return await {
                status,
                errorMessage,
                result: {
                    appStoreUrl,
                    playStoreUrl
                }
            };
        } catch (error) {
            return {
                status: 400,
                errorMessage: 'Something went wrong. ' + error
            }
        }
    }
};

export default getApplicationVersionInfo;