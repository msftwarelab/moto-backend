import ListPhotosCommonType from '../../types/ListPhotosType';
import { ListPhotos, Listing } from '../../../data/models';

import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const ShowListPhotos = {

    type: ListPhotosCommonType,

    args: {
        listId: { type: IntType },
    },

    async resolve({ request, response }, { listId }) {

        try {
            if (request.user || request.user.admin) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
                let where = { listId };
                let listWhere = { id: listId };
                if (!request.user.admin) {

                    listWhere = {
                        id: listId,
                        userId: request.user.id
                    }
                };
                const listingPhotos = await ListPhotos.findAll({
                    where: { listId },
                    include: [
                        { model: Listing, as: 'listing', where: listWhere }
                    ]
                });

                if (listingPhotos.length > 0) {
                    return {
                        results: listingPhotos,
                        status: 200
                    }
                } else {
                    return {
                        status: 400,
                        errorMessage: "Something went wrong",
                    };
                }
            } else {
                return {
                    status: 500,
                    errorMessage: "You are not LoggedIn",
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

export default ShowListPhotos;
