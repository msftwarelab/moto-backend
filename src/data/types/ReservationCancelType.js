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
import { Listing } from '../models';
import ShowListingType from './ShowListingType';

const ReservationCancelType = new ObjectType({
    name: 'ReservationCancel',
    fields: {
        reservationId: {
            type: IntType
        },
        cancellationPolicy: {
            type: StringType
        },
        refundToGuest: {
            type: FloatType
        },
        payoutToHost: {
            type: FloatType
        },
        threadId: {
            type: IntType
        },
        checkIn: {
            type: StringType
        },
        checkOut: {
            type: StringType
        },
        startTime: {
            type: FloatType
        },
        endTime: {
            type: FloatType
        },
        guests: {
            type: IntType
        },
        cancelledBy: {
            type: StringType
        },
        startedIn: {
            type: IntType
        },
        rentingFor: {
            type: FloatType
        },
        currency: {
            type: StringType
        },
        hostEmail: {
            type: StringType
        },
        listId: {
            type: IntType
        },
        guestServiceFee: {
            type: FloatType,
        },
        hostServiceFee: {
            type: FloatType,
        },
        total: {
            type: FloatType,
        },
        confirmationCode: {
            type: IntType
        },
        listTitle: {
            type: StringType
        },
        nonRefundableDayPrice: {
            type: FloatType
        },
        guestEmail: {
            type: StringType
        },
        hostName: {
            type: StringType
        },
        status: {
            type: StringType
        },
        guestName: {
            type: StringType
        },
        errorMessage: {
            type: StringType
        },
        hostProfilePicture: {
            type: StringType,
        },
        guestProfilePicture: {
            type: StringType,
        },
        listData: {
            type: ShowListingType,
            resolve(reservation) {
                return Listing.findOne({
                    where: { id: reservation.listId }
                })
            }
        },
        isSpecialPriceAverage: {
            type: FloatType,
        },
        guestCreatedAt: {
            type: StringType,
        },
        hostCreatedAt: {
            type: StringType,
        }
    }
});


export default ReservationCancelType;
