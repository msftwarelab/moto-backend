import PayoutWholeType from '../../types/PayoutWholeType';
import { Payout } from '../../models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getPayouts = {

    type: PayoutWholeType,

    args: {},

    async resolve({ request }, { }) {
        try {
            if (request.user && !request.user.admin) {
                let userId = request.user.id

                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }

                const results = await Payout.findAll({
                    where: {
                        userId
                    },
                    order: [
                        [`default`, `DESC`],
                    ],
                })


                return await {
                    results,
                    status: 200
                }


            } else {
                return {
                    status: 500,
                    errorMessage: 'You must login to get your profile information.'
                }
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    }
};

export default getPayouts;

/**

query ($currentAccountId: String) {
  getPayouts (currentAccountId: $currentAccountId) {
    results {
     id
    methodId
    userId
    payEmail
    address1
    address2
    city
    state
    country
    zipcode
    currency
    createdAt
    isVerified
    status
    }
  }
}
    

**/