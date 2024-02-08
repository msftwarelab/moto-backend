// GrpahQL
import {
    GraphQLList as List,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType,
} from 'graphql';

// GraphQL Type
import ListBlockedDatesResponseType from '../../types/ListBlockedDatesType';

// Sequelize models
import {
    Listing,
    ListBlockedDates
} from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const updateListBlockedDates = {

    type: ListBlockedDatesResponseType,

    args: {
        listId: { type: new NonNull(IntType) },
        blockedDates: { type: new List(StringType) },
    },

    async resolve({ request, response }, {
        listId,
        blockedDates
    }) {

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

                let where = { listId };
                if (!request.user.admin) {
                    where = {
                        listId,
                        userId: request.user.id
                    }
                };

                // Confirm whether the Listing Id is available
                const isListingAvailable = await Listing.findById(listId);
                let isValue = false;

                if (isListingAvailable) {
                    if (blockedDates) {
                        const blockedDatesData = await ListBlockedDates.findAll({
                            where: {
                                listId,
                                reservationId: {
                                    $eq: null
                                }
                            }
                        });

                        // Remove all the blocked dates except reservation dates
                        const removeBlockedDates = await ListBlockedDates.destroy({
                            where: {
                                listId,
                                reservationId: {
                                    $eq: null
                                }
                            }
                        });

                        if (blockedDatesData.length > 0) {

                            let blockedDatesItems = [];
                            blockedDatesData.map((item, key) => {
                                blockedDatesItems[key] = new Date(item.blockedDates);
                            });


                            blockedDates.map(async (item, key) => {
                                let day = new Date(item);
                                let blockedItem = blockedDatesItems.map(Number).indexOf(+day);
                                if (blockedItem > -1) {
                                    let createRecord = await ListBlockedDates.findOrCreate({
                                        where: {
                                            listId,
                                            blockedDates: item,
                                            // calendarId: blockedDatesData[blockedItem].calendarId
                                        },
                                        defaults: {
                                            //properties you want on create
                                            listId,
                                            blockedDates: new Date(item),
                                            // calendarId: blockedDatesData[blockedItem].calendarId
                                        }
                                    });
                                } else {
                                    let createRecord = await ListBlockedDates.findOrCreate({
                                        where: {
                                            listId,
                                            blockedDates: item
                                        },
                                        defaults: {
                                            //properties you want on create
                                            listId,
                                            blockedDates: new Date(item),
                                        }
                                    });
                                }
                            });
                            isValue = true;
                        } else {
                            blockedDates.map(async (item, key) => {
                                let updateBlockedDates = await ListBlockedDates.findOrCreate({
                                    where: {
                                        listId,
                                        blockedDates: item
                                    },
                                    defaults: {
                                        //properties you want on create
                                        listId,
                                        blockedDates: new Date(item)
                                    }
                                });
                            });
                            isValue = true;
                        }

                        if (isValue) {
                            const listBlockedData = await ListBlockedDates.findAll({
                                where: {
                                    listId
                                },
                                raw: true
                            });
                            return {
                                results: listBlockedData,
                                status: 200
                            }
                        }

                    } else {
                        return {
                            status: 400,
                            errorMessage: 'Please select dates'
                        }
                    }
                } else {
                    return {
                        status: 400,
                        errorMessage: 'Please send correct list id'
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
                status: 400,
                errorMessage: 'Something went wrong' + error
            };
        }

    },

};

export default updateListBlockedDates;


/*
mutation (
    $listId: Int!,
    $blockedDates: [String]
) {
    updateListBlockedDates (
        listId: $listId,
        blockedDates: $blockedDates
    )
    {
        status
    }
}
*/