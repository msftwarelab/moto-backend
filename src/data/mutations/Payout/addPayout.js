import GetPayoutType from '../../types/GetPayoutType';
import { Payout, User } from '../../models';
import stripePackage from 'stripe';
import { payment, url } from '../../../config';

import {
  GraphQLString as StringType,
  GraphQLInt as IntType,
} from 'graphql';
import { isEuropeCountry } from '../../../helpers/europeCountryHelpers';

const stripe = stripePackage(payment.stripe.secretKey, {
  apiVersion: '2019-12-03'
});

import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const addPayout = {

  type: GetPayoutType,

  args: {
    methodId: { type: IntType },
    payEmail: { type: StringType },
    address1: { type: StringType },
    address2: { type: StringType },
    city: { type: StringType },
    state: { type: StringType },
    country: { type: StringType },
    zipcode: { type: StringType },
    currency: { type: StringType },
    firstname: { type: StringType },
    lastname: { type: StringType },
    accountNumber: { type: StringType },
    routingNumber: { type: StringType },
    businessType: { type: StringType },
    accountToken: { type: StringType },
    personToken: { type: StringType },
  },

  async resolve({ request }, {
    methodId,
    payEmail,
    address1,
    address2,
    city,
    state,
    country,
    zipcode,
    currency,
    firstname,
    lastname,
    accountNumber,
    routingNumber,
    businessType,
    accountToken,
    personToken
  }) {

    try {
      let userId = request.user.id;
      let defaultvalue = false;
      let status = 200, errorMessage, createPayout, connectUrl, stripeAccountId;
      let business_type = null;
      let requested_capabilities = ['card_payments', 'transfers'];
      let external_account = {};
      let createPersonToken, person;

      if (request.user) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        let where = {
          id: userId,
          userBanStatus: 1
        };

        const isUserBan = await User.findOne({ attributes: ['id'], where, raw: true });

        if (!isUserBan) {
          if (methodId == 1) {
            //Pay Pal
            let count = await Payout.count({
              where: {
                userId,
                default: true
              }
            });

            if (count <= 0) {
              defaultvalue = true;
            }

            const payout = await Payout.create({
              methodId,
              userId,
              payEmail,
              address1,
              address2,
              city,
              state,
              country,
              zipcode,
              currency,
              default: defaultvalue,
              last4Digits: null,
              isVerified: true
            });

            if (payout) {
              return {
                status
              }
            } else {
              status = 400

              return {
                status
              }
            }

          } else if (methodId == 2) {

            try {

              business_type = businessType ? businessType : 'individual';
              external_account = {
                object: "bank_account",
                country: country,
                currency: currency,
                account_number: accountNumber
              };

              if (!isEuropeCountry(country) && routingNumber) { // Non Europe countries - Routing Number param
                external_account['routing_number'] = routingNumber;
              }
              if (business_type === 'individual') {
                createPayout = await stripe.accounts.create({
                  type: "custom",
                  country: country,
                  email: payEmail,
                  requested_capabilities,
                  external_account,
                  account_token: accountToken,
                  metadata: {
                    userId: request.user.id
                  }
                });

                stripeAccountId = createPayout.id;

              } else if (business_type === 'company') {

                if (!personToken) {
                  person = {
                    email: payEmail,
                    address: {
                      line1: address1,
                      city: city,
                      state: state,
                      country: country,
                      postal_code: zipcode
                    },
                    relationship: {
                      representative: true
                    }
                  };
                  createPersonToken = await stripe.tokens.create({ person });
                  if (createPersonToken) {
                    personToken = createPersonToken.id;
                  } else {
                    status = 400;
                    errorMessage = createPersonToken.message || (createPersonToken.error && createPersonToken.error.message);
                  };
                }

                createPayout = await stripe.accounts.create({
                  type: "custom",
                  country,
                  email: payEmail,
                  requested_capabilities,
                  external_account,
                  account_token: accountToken,
                  metadata: {
                    userId: request.user.id
                  }
                });

                stripeAccountId = createPayout.id;

                // Because this is a business (and not an individual), we'll need to specify
                // the account opener by email address using the Persons API.
                const accountOpener = await stripe.account.createPerson(stripeAccountId, {
                  person_token: personToken
                });
              }

              let successUrl = url + '/user/payout/success?account=' + stripeAccountId;
              let failureUrl = url + '/user/payout/failure?account=' + stripeAccountId;

              const accountLinks = await stripe.accountLinks.create({
                account: stripeAccountId,
                failure_url: failureUrl,
                success_url: successUrl,
                type: 'custom_account_verification',
                collect: 'currently_due', // currently_due or eventually_due
              });

              connectUrl = accountLinks.url; // Account links API on-boarding URL

              return await {
                status,
                errorMessage,
                connectUrl,
                successUrl,
                failureUrl,
                stripeAccountId
              }

            } catch (error) {
              status = 400;
              errorMessage = error.message;

              return {
                status,
                errorMessage
              }
            }

          } else {
            status = 400
            errorMessage = 'Please choose the payout method and try again'

            return {
              status,
              errorMessage
            }
          }
        } else {
          status = 400
          errorMessage = 'Oops! It looks like your account is deactivated and please contact support.'

          return {
            status,
            errorMessage
          }
        }

      } else {
        return {
          status: 500,
          errorMessage: 'Please login with your account and try again.',
        };
      }
    } catch (error) {
      return {
        status: 400,
        errorMessage: 'Something went wrong.' + error.message
      }
    }
  },
};

export default addPayout;

/**
mutation addPayout($id: Int!, $type: String!) {
    addPayout(id: $id, type: $type) {
        status
    }
}
 */
