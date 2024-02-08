import ShowListingType from '../../types/ShowListingType';
import ListingType from '../../types/ListingType';
import { Listing } from '../../models';

import {
    GraphQLList as List,
    GraphQLSring as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const viewListing = {

    type: ListingType,

    args: {
        listId: { type: IntType },
        preview: { type: BooleanType },
    },

    async resolve({ request }, { listId, preview }) {

        try {
            let where;

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            if (request.user && preview) {
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
                    isPublished: true,
                };
            }
            const getResults = await Listing.findOne({
                where
            });

            if (getResults) {
                return {
                    results: getResults,
                    status: 200
                }
            } else {
                return {
                    status: 400,
                    errorMessage: "Something Went Wrong"
                }
            }

            // return Listing.findOne({
            //     where: {
            //         id:listId,
            //         isPublished: true,
            //     }
            // })

        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    }


}


export default viewListing;
