import {
    GraphQLObjectType as ObjectType,
    GraphQLBoolean as BooleanType,
    GraphQLString as StringType,
    GraphQLInt as IntType
} from 'graphql';

import ReservationType from './ReservationType';

const ReservationPaymentType = new ObjectType({
    name: 'ReservationPayment',
    fields: {
        results: {
            type: ReservationType
        },
        status: {
            type: IntType
        },
        errorMessage: {
            type: StringType
        },
        requireAdditionalAction: {
            type: BooleanType
        },
        paymentIntentSecret: {
            type: StringType
        },
        paymentIntentId: {
            type: StringType,
        },
        reservationId: {
            type: IntType
        },
        redirectUrl: {
            type: StringType
        }
    }
});

export default ReservationPaymentType;