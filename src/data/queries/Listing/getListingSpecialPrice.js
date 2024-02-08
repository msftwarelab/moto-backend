import { Listing, ListBlockedDates } from '../../models';

import ListBlockedDatesType from '../../types/ListBlockedDatesType';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
} from 'graphql';

import moment from 'moment';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getListingSpecialPrice = {

    type: ListBlockedDatesType,

    args: {
        listId: { type: new NonNull(IntType) }
    },

    async resolve({ request }, { listId }) {

        try {

            let where, previousDay = moment().subtract(1, 'days');

            if (request && (request.user || request.user.admin)) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                where = {
                    listId: listId
                };

                const listingData = await ListBlockedDates.findAll({
                    // where
                    where: {
                        listId,
                        blockedDates: {
                            $gte: previousDay
                        },
                    },
                    order: [[`blockedDates`, `ASC`]],
                });
                if (listingData) {
                    return {
                        results: listingData,
                        status: 200
                    }
                } else {
                    return {
                        status: 400,
                        errorMessage: "Something Went Wrong"
                    }
                }

            } else {
                return {
                    status: 500,
                    errorMessage: "You are not LoggedIn"
                }
            }

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }

    },
};

export default getListingSpecialPrice;

/**

query getListingSpecialPrice($listId: Int!){
    getListingSpecialPrice {

    }
}
 */
