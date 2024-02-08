import checkUserBanStatus from "../../../libs/checkUserBanStatus";
import ReservationPaymentType from "../../types/ReservationPaymentType";
import {
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType,
    GraphQLString as StringType,
    GraphQLList as List
} from 'graphql';
import { ClaimImages, Currencies, CurrencyRates, Reservation, ThreadItems, Threads } from "../../models";
import { convert } from "../../../helpers/currencyConvertion";

const updateClaim = {
    type: ReservationPaymentType,
    args: {
        reservationId: { type: new NonNull(IntType) },
        claimAmount: { type: new NonNull(FloatType) },
        claimReason: { type: new NonNull(StringType) },
        claimImages: { type: new List(StringType) },
        currency: { type: new NonNull(StringType) }
    },
    async resolve({ request }, { reservationId, claimAmount, claimReason, claimImages, currency }) {
        try {
            if (!request.user || !request.user.id) return { status: 500, errorMessage: 'Please login with your account and try again.' };
            const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id);
            if (userStatusErrorMessage) return { status: userStatusError, errorMessage: userStatusErrorMessage };
            const data = await CurrencyRates.findAll({ raw: true });
            const base = await Currencies.findOne({ where: { isBaseCurrency: true }, raw: true });
            let ratesData = {}, rates, convertClaimAmount = 0;
            if (data && data.length > 0) {
                data.map((item) => {
                    ratesData[item.currencyCode] = item.rate;
                })
            }
            rates = ratesData;
            const reservation = await Reservation.findOne({ where: { id: reservationId, claimStatus: 'pending', securityDeposit: { $gte: 0 } }, raw: true });
            if (!reservation) return { status: 400, errorMessage: 'Oops! Something went wrong' };
            convertClaimAmount = convert(base.symbol, rates, claimAmount, currency, reservation.currency);
            await Reservation.update({ claimAmount: convertClaimAmount, claimStatus: 'requested', claimReason }, { where: { id: reservationId } });
            if (Array.isArray(claimImages) && claimImages.length > 0) await ClaimImages.bulkCreate(claimImages.map(item => ({ reservationId, image: item })));
            const threadItems = await ThreadItems.findOne({ where: { reservationId }, raw: true });
            if (threadItems) {
                await ThreadItems.create({ reservationId, type: 'claimRequested', sentBy: request.user.id, startDate: threadItems.startDate, threadId: threadItems.threadId, endDate: threadItems.endDate, startTime: threadItems.startTime, endTime: threadItems.endTime, personCapacity: threadItems.personCapacity })
                await Threads.update({
                    isRead: false,
                    messageUpdatedDate: new Date()
                },
                    {
                        where: {
                            id: threadItems.threadId
                        }
                    }
                );
            };
            return { status: 200 };
        } catch (error) {
            return { status: 400, errorMessage: error };
        }
    }
}

export default updateClaim;

/*

mutation updateClaim($reservationId: Int!, $claimAmount: Float!, $claimReason: String!, $claimImages: [String]){
    updateClaim(reservationId: $reservationId, claimAmount: $claimAmount, claimReason: $claimReason, claimImages: $claimImages){
        status
        errorMessage
    }
}

*/