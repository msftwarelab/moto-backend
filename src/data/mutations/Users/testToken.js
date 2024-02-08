// GrpahQL
import {
  GraphQLString as StringType,
} from 'graphql';
// Config
import { payment } from '../../../config';


import stripePackage from 'stripe';
const stripe = stripePackage(payment.stripe.secretKey);

import UserType from '../../types/UserType';

const testToken = {
  type: UserType,

  args: {
    token: { type: StringType }
  },

  async resolve({ request, response }, {
    token
  }) {
    try {


      // createCard = await stripe.tokens.create({
      //   card: cardDetails
      // });
      let createCard = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          //number: '4242424242424242',
          number: '4111111111111111',
          exp_month: 2,
          exp_year: 2031,
          cvc: '314'
        },
      })

      return {
        userToken: createCard && createCard.id,
        status: 200
      }

    } catch (error) {
      return {
        errorMessage: 'Something went wrong! ' + error,
        status: 400
      }
    }
  }

};

export default testToken;

/*

mutation (
    $token: String
) {
    testToken (
        token: $token
    ) {
          userToken
            status
            errorMessage
    }
}

*/