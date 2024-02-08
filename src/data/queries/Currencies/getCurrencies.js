import AllCurrenciesType from '../../types/AllCurrenciesType';
import { Currencies } from '../../../data/models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getCurrencies = {

    type: AllCurrenciesType,

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

            const getAllCurrencies = await Currencies.findAll({
                where: {
                    isEnable: true
                }
            });

            if (getAllCurrencies && getAllCurrencies.length > 0) {
                return {
                    results: getAllCurrencies,
                    status: 200
                }
            } else {
                return {
                    status: 400,
                    errorMessage: "Something Went Wrong"
                }
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 500
            };
        }


    },
};

export default getCurrencies;
