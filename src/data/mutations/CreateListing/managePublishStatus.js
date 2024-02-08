import ShowListingType from '../../types/ShowListingType';
import { Listing, WishList, Reservation } from '../../../data/models';
import ListType from '../../types/ListType';


import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const managePublish = {

    type: ListType,

    args: {
        listId: { type: new NonNull(IntType) },
        action: { type: new NonNull(StringType) },
    },

    async resolve({ request }, { listId, action }) {

        try {
            // Check whether user is logged in
            if (request.user || request.user.admin) {

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                let where = { id: listId, isReady: true };
                if (!request.user.admin) {
                    where = {
                        id: listId,
                        isReady: true,
                        userId: request.user.id
                    }
                };

                var published;
                // Publish
                if (action === 'publish') {
                    const publish = await Listing.update({
                        isPublished: true
                    }, {
                        where
                    }).spread(function (instance) {
                        // Check if any rows are affected
                        if (instance > 0) {
                            published = true;
                        }
                    });

                    let updateListingStatus = await WishList.update({
                        isListActive: true
                    }, {
                        where: {
                            listId
                        }
                    });
                }

                // UnPublish
                if (action === 'unPublish') {

                    const getReservationCount = await Reservation.count({
                        where: {
                            listId,
                            paymentState: 'completed',
                            $or: [
                                {

                                    reservationState: 'approved'
                                },
                                {
                                    reservationState: 'pending'
                                }
                            ],
                        },
                    });

                    if (getReservationCount > 0) {
                        return {
                            status: 400,
                            errorMessage: 'You cannot unpublish as you have upcoming bookings or enquiries for this listing.'
                        }
                    } else {
                        const unPublish = await Listing.update({
                            isPublished: false
                        }, {
                            where
                        }).spread(function (instance) {
                            // Check if any rows are affected
                            if (instance > 0) {
                                published = true;
                            }
                        });

                        let updateListingStatus = await WishList.update({
                            isListActive: false
                        }, {
                            where: {
                                listId
                            }
                        });
                    }
                }

                if (published) {
                    return {
                        status: 200,
                    };
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Something went wrong'
                    }
                }

            }

            else {
                return {
                    status: 500,
                    errorMessage: 'Not a logged user'
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

export default managePublish;

/**
mutation ManagePublish($listId: Int!, $action: String!) {
    managePublish(listId: $listId, action: $action) {
        status
    }
}
 */
