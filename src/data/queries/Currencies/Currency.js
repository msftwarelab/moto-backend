import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
} from 'graphql';

import CurrencyType from '../../types/CurrencyType';

// Sequelize models
import { CurrencyRates, Currencies } from '../../../data/models';

// Helper
import { convert } from '../../../helpers/currencyConvertion';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const Currency = {

    type: CurrencyType,

    async resolve({ request, response }) {
        try {
            let ratesData = {}, rates;
            const data = await CurrencyRates.findAll();
            const base = await Currencies.findOne({ where: { isBaseCurrency: true } });
            const allCurrencies = await Currencies.findAll();

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            if (data) {
                data.map(async (item) => {
                    await Promise.all(allCurrencies.map((inner, innerKey) => {
                        if (item.dataValues.currencyCode == inner.dataValues.symbol) {
                            ratesData[item.dataValues.currencyCode] = item.dataValues.rate;
                        }
                    }))
                })
            }
            rates = JSON.stringify(ratesData);

            if (rates && base) {
                return {
                    result: {
                        base: base.symbol,
                        rates,
                    },
                    // base: base.symbol,
                    // rates,
                    status: 200
                };
            } else {
                return {
                    status: 400,
                    errorMessage: "Something Went Wrong"
                };
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    },
};

export default Currency;