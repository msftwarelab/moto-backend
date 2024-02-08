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
import EditListingResponseType from '../../types/EditListingType';

// Sequelize models
import {
    Listing,
    UserHouseRules,
    ListingData,
    ListPhotos
} from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const updateListingStep3 = {

    type: EditListingResponseType,

    args: {
        id: { type: IntType },
        carRules: { type: new List(IntType) },
        bookingNoticeTime: { type: StringType },
        checkInStart: { type: StringType },
        checkInEnd: { type: StringType },
        maxDaysNotice: { type: StringType },
        minDay: { type: IntType },
        maxDay: { type: IntType },
        basePrice: { type: FloatType },
        delivery: { type: FloatType },
        currency: { type: StringType },
        weeklyDiscount: { type: IntType },
        monthlyDiscount: { type: IntType },
        blockedDates: { type: new List(StringType) },
        bookingType: { type: new NonNull(StringType) },
        cancellationPolicy: { type: IntType },
        securityDeposit: { type: FloatType }
    },

    async resolve({ request, response }, {
        id,
        carRules,
        bookingNoticeTime,
        checkInStart,
        checkInEnd,
        maxDaysNotice,
        minDay,
        maxDay,
        basePrice,
        delivery,
        currency,
        weeklyDiscount,
        monthlyDiscount,
        blockedDates,
        bookingType,
        cancellationPolicy,
        securityDeposit
    }) {

        try {

            let isListUpdated = false;

            // Check whether user is logged in
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

                // Confirm whether the Listing Id is available
                const isListingAvailable = await Listing.findById(id);

                if (isListingAvailable) {

                    // Update Booking Type
                    if (bookingType) {
                        const updateBookingType = await Listing.update({
                            bookingType,
                            lastUpdatedAt: new Date()
                        }, {
                            where
                        })
                    }

                    // Car Rules
                    if (carRules) {
                        let carRulesData = [];
                        if (carRules.length > 0) {
                            await Promise.all(carRules.map(async (item, key) => {
                                carRulesData.push({
                                    listId: id,
                                    houseRulesId: item
                                });
                            }));
                        };

                        await UserHouseRules.destroy({
                            where: {
                                listId: id
                            }
                        });
                        if (carRules.length > 0) await UserHouseRules.bulkCreate(carRulesData);
                    }

                    // Check if record already available for this listing
                    const isListingDataAvailabile = await ListingData.findOne({
                        attributes: ['listId'],
                        where: { listId: id },
                        raw: true
                    });
                    if (isListingDataAvailabile) {
                        // Update Record
                        const updateData = await ListingData.update({
                            bookingNoticeTime,
                            checkInStart,
                            checkInEnd,
                            maxDaysNotice,
                            minDay,
                            maxDay,
                            basePrice,
                            delivery,
                            currency,
                            weeklyDiscount,
                            monthlyDiscount,
                            cancellationPolicy,
                            bookingType,
                            securityDeposit
                        },
                            {
                                where: {
                                    listId: id
                                }
                            });

                        isListUpdated = true;
                    } else {
                        // Create New Record
                        const createData = await ListingData.create({
                            listId: id,
                            bookingNoticeTime,
                            checkInStart,
                            checkInEnd,
                            maxDaysNotice,
                            minDay,
                            maxDay,
                            basePrice,
                            delivery,
                            currency,
                            weeklyDiscount,
                            monthlyDiscount,
                            cancellationPolicy,
                            bookingType,
                            securityDeposit
                        });

                        if (createData) {
                            isListUpdated = true;
                        }
                    }

                    if (isListUpdated) {
                        const photosCount = await ListPhotos.count({ where: { listId: id } });
                        if (photosCount > 0) {
                            const updateListingStatus = await Listing.update({
                                isReady: true
                            }, {
                                where: { id }
                            });
                        }

                        const listData = await ListingData.findOne({ where: { listId: id }, raw: true });

                        return await {
                            status: 200,
                            actionType: 'update',
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
                        status: 400,
                        errorMessage: 'Oops! your listing is not found!'
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

export default updateListingStep3;