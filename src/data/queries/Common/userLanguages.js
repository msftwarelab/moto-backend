// GrpahQL
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
} from 'graphql';

import userLanguagesType from '../../types/userLanguagesType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const userLanguages = {
    type: userLanguagesType,

    async resolve({ request, response }) {
        let languages = [
            { value: "id", label: "Bahasa Indonesia" },
            { value: "ms", label: "Bahasa Melayu" },
            { value: "ca", label: "Català" },
            { value: "da", label: "Dansk" },
            { value: "de", label: "Deutsch" },
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "el", label: "Eλληνικά" },
            { value: "fr", label: "Français" },
            { value: "it", label: "Italiano" },
            { value: "hu", label: "Magyar" },
            { value: "nl", label: "Nederlands" },
            { value: "no", label: "Norsk" },
            { value: "pl", label: "Polski" },
            { value: "pt", label: "Português" },
            { value: "fi", label: "Suomi" },
            { value: "sv", label: "Svenska" },
            { value: "tr", label: "Türkçe" },
            { value: "is", label: "Íslenska" },
            { value: "cs", label: "Čeština" },
            { value: "ru", label: "Русский" },
            { value: "th", label: "ภาษาไทย" },
            { value: "zh", label: "中文 (简体)" },
            { value: "zh-TW", label: "中文 (繁體)" },
            { value: "ja", label: "日本語" },
            { value: "ko", label: "한국어" }
        ];

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

            return {
                status: 200,
                result: languages
            };
        } catch (error) {
            return {
                errorMessage: 'Something went wrong.' + error,
                status: 400
            }
        }
    }
};

export default userLanguages;

/*

query {
    userLanguages {       
        status
        errorMessage
        languages {
            label
            value
        }
    }
}

*/