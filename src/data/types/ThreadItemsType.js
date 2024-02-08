import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType
} from 'graphql';
// Models
import { CancellationDetails } from '../models'
// Types
import CancellationDetailsType from './CancellationDetailsType';
import moment from 'moment';
const ThreadItemsType = new ObjectType({
    name: 'ThreadItems',
    fields: {
        id: {
            type: IntType
        },
        threadId: {
            type: IntType
        },
        reservationId: {
            type: IntType
        },
        sentBy: {
            type: StringType
        },
        content: {
            type: StringType
        },
        type: {
            type: StringType
        },
        startDate: {
            type: StringType
        },
        endDate: {
            type: StringType
        },
        startTime: {
            type: FloatType
        },
        endTime: {
            type: FloatType
        },
        personCapacity: {
            type: IntType
        },
        isRead: {
            type: BooleanType
        },
        createdAt: {
            type: StringType
        },
        status: {
            type: IntType
        },
        userBanStatus: {
            type: IntType
        },
        cancelData: {
            type: CancellationDetailsType,
            resolve(threadItems) {
                return CancellationDetails.findOne({ where: { reservationId: threadItems.reservationId } });
            }
        },
        userBanStatus: {
            type: IntType
        },
        errorMessage: { type: StringType }
    }
});
export default ThreadItemsType;