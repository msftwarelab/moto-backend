import ListBlockedDatesResponseType from '../../types/ListBlockedDatesType';
import { ListBlockedDates, Listing } from '../../models';


import ListingType from '../../types/ListingType';


import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getListBlockedDates = {

    type: ListingType,

    args: {
        listId: { type: new NonNull(IntType) }
    },

    async resolve({ request }, { listId }) {
        try {
            let where;
            if (request.user) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                if (!request.user.admin) {
                    const userId = request.user.id;
                    where = {
                        id: listId,
                        userId
                    };
                } else {
                    where = {
                        id: listId
                    };
                }
            } else {
                where = {
                    id: listId,
                    //isPublished: true,
                };
            }

            const listingData = await Listing.findOne({
                where
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


        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }

    },
};

export default getListBlockedDates;

/**

query getListBlockedDates($listId: Int!){
    getListBlockedDates {

    }
}
 */
