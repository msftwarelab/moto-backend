// GrpahQL
import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType,
} from 'graphql';
import { url } from '../../../config';

// GraphQL Type
import EditListingResponseType from '../../types/EditListingType';

// Sequelize models
import {
    Listing,
} from '../../../data/models';

// import fetch from '../../core/fetch';
import fetch from '../../../libs/fetch';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const updateListingStep2 = {

    type: EditListingResponseType,

    args: {
        id: { type: IntType },
        title: { type: StringType },
        description: { type: StringType },
        coverPhoto: { type: IntType },
    },

    async resolve({ request, response }, {
        id,
        title,
        description,
        coverPhoto
    }) {

        try {


            let isListUpdated = false;

            if (request.user || request.user.admin) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                let where = { id };
                if (!request.user.admin) {
                    where = {
                        id,
                        userId: request.user.id
                    }
                };

                const doUpdateListing = await Listing.update({
                    title,
                    description,
                    coverPhoto,
                    lastUpdatedAt: new Date()
                },
                    {
                        where
                    })
                    .then(function (instance) {
                        // Check if any rows are affected
                        if (instance > 0) {
                            isListUpdated = true;
                        }
                    });


                if (isListUpdated) {
                    const listData = await Listing.findOne({
                        where: {
                            id: id
                        },
                        raw: true
                    });

                    return {
                        status: 200,
                        results: listData
                    }
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Failed to update'
                    }
                }

            } else {
                return {
                    status: 500,
                    errorMessage: 'Not a logged user'
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

export default updateListingStep2;
