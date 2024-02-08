import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType,
    GraphQLList as List,
} from 'graphql';
import moment from 'moment';
// Models
import { Listing, UserProfile, Threads, Payout, TransactionHistory, Transaction, CancellationDetails, User, ThreadItems, ClaimImages, Country } from '../models';

// Type
import ThreadsType from './ThreadsType';
import ShowListingType from './ShowListingType';
import ProfileType from './ProfileType';
import PayoutType from './PayoutType';
import TransactionHistoryType from './TransactionHistoryType';
import TransactionType from './TransactionType';
import CancellationDetailsType from './CancellationDetailsType';
import UserType from './UserType';
import ThreadItemsType from './ThreadItemsType';


const ReservationType = new ObjectType({
    name: 'Reservation',
    fields: {
        id: {
            type: IntType
        },
        listId: {
            type: IntType
        },
        days: {
            type: IntType,
            async resolve(reser) {
                let totalDays = 0, momentStartDate, momentEndDate;
                if (reser.checkIn != null && reser.checkOut != null) {
                    momentStartDate = moment(reser.checkIn);
                    momentEndDate = moment(reser.checkOut);
                    totalDays = momentEndDate.diff(momentStartDate, 'days');
                }
                return await totalDays + 1;
            }
        },
        listTitle: {
            type: StringType
        },
        listData: {
            type: ShowListingType,
            resolve(reservation) {
                return Listing.findOne({
                    where: {
                        id: reservation.listId,
                    }
                })
            }
        },
        hostId: {
            type: StringType
        },
        hostPayout: {
            type: PayoutType,
            resolve(reservation) {
                if (reservation.payoutId != null && reservation.payoutId > 0) {
                    return Payout.findOne({
                        where: {
                            userId: reservation.hostId,
                            id: reservation.payoutId
                        }
                    })
                } else {
                    return Payout.findOne({
                        where: {
                            userId: reservation.hostId,
                            default: true
                        }
                    })
                }
            }
        },
        hostTransaction: {
            type: TransactionHistoryType,
            resolve(reservation) {
                return TransactionHistory.findOne({
                    where: {
                        reservationId: reservation.id,
                    }
                })
            }
        },
        hostData: {
            type: ProfileType,
            resolve(reservation) {
                return UserProfile.findOne({
                    where: { userId: reservation.hostId }
                });
            }
        },
        guestId: {
            type: StringType
        },
        guestData: {
            type: ProfileType,
            resolve(reservation) {
                return UserProfile.findOne({
                    where: { userId: reservation.guestId }
                })
            }
        },
        transaction: {
            type: TransactionType,
            resolve(reservation) {
                return Transaction.findOne({
                    where: { reservationId: reservation.id, paymentType: 'booking' }
                })
            }
        },
        refundStatus: {
            type: TransactionType,
            resolve(reservation) {
                return Transaction.findOne({
                    where: { reservationId: reservation.id, paymentType: 'cancellation' }
                })
            }
        },
        guestUser: {
            type: UserType,
            resolve(reservation) {
                return User.findOne({
                    where: { Id: reservation.guestId }
                })
            }
        },
        hostUser: {
            type: UserType,
            resolve(reservation) {
                return User.findOne({
                    where: { Id: reservation.hostId }
                })
            }
        },
        checkIn: {
            type: StringType
        },
        checkOut: {
            type: StringType
        },
        guests: {
            type: IntType
        },
        message: {
            type: StringType
        },
        basePrice: {
            type: FloatType
        },
        delivery: {
            type: FloatType
        },
        currency: {
            type: StringType
        },
        discount: {
            type: FloatType
        },
        discountType: {
            type: StringType
        },
        guestServiceFee: {
            type: FloatType,
        },
        hostServiceFee: {
            type: FloatType,
        },
        total: {
            type: FloatType,
            resolve: reservation => (Number(reservation.total) || 0) + (Number(reservation.securityDeposit) || 0)
        },
        totalWithGuestServiceFee: {
            type: FloatType,
            resolve(reser) {
                return (Number(reser.total) || 0) + (Number(reser.guestServiceFee) || 0) + (Number(reser.securityDeposit) || 0);
            }
        },
        totalWithoutSecurityFee: {
            type: FloatType,
            resolve(reser) {
                return (Number(reser.total) || 0);
            }
        },
        confirmationCode: {
            type: IntType
        },
        reservationState: {
            type: StringType
        },
        paymentState: {
            type: StringType
        },
        payoutId: {
            type: IntType
        },
        paymentMethodId: {
            type: IntType
        },
        messageData: {
            type: ThreadsType,
            resolve(reservation) {
                return Threads.findOne({
                    where: {
                        listId: reservation.listId,
                        $or: [
                            {
                                host: reservation.guestId
                            },
                            {
                                guest: reservation.guestId
                            }
                        ]
                    }
                });
            }
        },
        cancellationDetails: {
            type: CancellationDetailsType,
            resolve(reservation) {
                return CancellationDetails.findOne({
                    where: {
                        reservationId: reservation.id
                    }
                });
            }
        },
        createdAt: {
            type: StringType
        },
        updatedAt: {
            type: StringType
        },
        count: {
            type: IntType
        },
        status: {
            type: StringType
        },
        paymentMethodId: {
            type: IntType
        },
        errorMessage: { type: StringType },
        cardToken: { type: StringType },
        threadData: {
            type: ThreadItemsType,
            resolve(reservation) {
                return ThreadItems.findOne({
                    where: {
                        reservationId: reservation.id,
                    }
                });
            }
        },
        cancellationPolicy: {
            type: IntType
        },

        isSpecialPriceAverage: {
            type: FloatType
        },

        dayDifference: {
            type: FloatType
        },

        startTime: {
            type: FloatType
        },
        endTime: {
            type: FloatType
        },
        licenseNumber: {
            type: StringType
        },
        firstName: {
            type: StringType
        },
        middleName: {
            type: StringType
        },
        lastName: {
            type: StringType
        },
        dateOfBirth: {
            type: StringType
        },
        countryCode: {
            type: StringType
        },
        countryLabel: {
            type: StringType,
            async resolve(listSettings) {
                if (listSettings && listSettings.countryCode) {
                    let foundSetting = await Country.findOne({
                        attributes: ['countryName'],
                        where: {
                            countryCode: listSettings.countryCode
                        },
                        raw: true
                    });

                    return await foundSetting.countryName;
                }
            }
        },
        paymentIntentId: {
            type: StringType
        },

        securityDeposit: {
            type: FloatType
        },
        claimStatus: {
            type: StringType
        },
        claimAmount: {
            type: FloatType
        },
        claimPayout: {
            type: FloatType
        },
        claimRefund: {
            type: FloatType
        },
        claimReason: {
            type: StringType
        },
        claimImages: {
            type: new List(StringType),
            async resolve(reservation) {
                const claimImages = await ClaimImages.findAll({ where: { reservationId: reservation.id }, raw: true });
                return claimImages.map(item => item.image);
            }
        },
        claimRefundedAt: {
            type: StringType,
            async resolve(reservation) {
                const threadItems = await ThreadItems.findOne({ attributes: ['createdAt'], where: { reservationId: reservation.id, type: 'claimRefunded' }, raw: true });
                return threadItems && threadItems.createdAt;
            }
        },
        actualEarnings: {
            type: FloatType,
            async resolve(reservation) {
                let actualEarnings = 0;

		if (reservation.reservationState == 'completed') {
                    actualEarnings = reservation.total - reservation.hostServiceFee;
                }

                if (reservation.reservationState == 'cancelled') {
                    const cancelData = await CancellationDetails.findOne({
                        attributes: ['payoutToHost', 'currency'],
                        where: {
                            reservationId: reservation.id
                        }
                    });
                    if (cancelData && cancelData.payoutToHost && cancelData.payoutToHost > 0) actualEarnings = cancelData.payoutToHost;
                }
                return actualEarnings;
            }
        },
        isClaimCancelStatus: { type: BooleanType }
    }
});


export default ReservationType;
