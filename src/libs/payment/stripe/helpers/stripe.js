import stripePackage from 'stripe';
import { payment } from '../../../../config';

const stripe = stripePackage(payment.stripe.secretKey);
import { getCustomerId, getCustomerEmail } from './getCustomerId';
import { updateUserProfile } from './updateUserProfile';
import { updateReservation } from './updateReservation';
import { createTransaction } from './createTransaction';
import { createThread } from './createThread';
import { blockDates } from './blockDates';
import { emailBroadcast } from './email';
import { isZeroDecimalCurrency } from '../../../../helpers/zeroDecimalCurrency';

export async function createCustomer(userId) {
    let customerId = await getCustomerId(userId);
    let customerEmail = await getCustomerEmail(userId);
    let status = 200, errorMessage;

    // If customer doesn't exist, create a customer
    if (!customerId) {
        try {
            let createCustomerData = await stripe.customers.create(
                { email: customerEmail }
            );
            if ('id' in createCustomerData) {
                customerId = createCustomerData.id;
                await updateUserProfile(
                    userId,
                    customerId
                );
            }
        } catch (error) {
            status = 400;
            errorMessage = error.message;
        }
    }

    return await {
        status,
        errorMessage,
        customerId,
        customerEmail
    }
}

export async function createStripePayment(cardToken, amount, currency, customerId, customerEmail, reservationId, listId, listTitle) {

    let intent, paymentIntentSecret, requireAdditionalAction = false, status = 200, errorMessage;
    // creating the payment intents with the payment method id.
    intent = await stripe.paymentIntents.create({
        payment_method: cardToken,
        amount: isZeroDecimalCurrency(currency) ? Math.round(amount) : Math.round(amount * 100),
        currency: currency,
        payment_method_types: ['card'],
        confirmation_method: 'manual',
        confirm: true,
        customer: customerId,
        description: 'Reservation from the Mobile App: ' + reservationId,
        metadata: {
            reservationId,
            listId: listId,
            title: listTitle
        },
        use_stripe_sdk: true
    });

    if (intent && (intent.status === 'requires_source_action' || intent.status === 'requires_action') && intent.next_action.type === 'use_stripe_sdk') {
        status = 400;
        requireAdditionalAction = true;
        paymentIntentSecret = intent.client_secret;
    } else if (intent && intent.status === 'succeeded') {
        status = 200;
    } else {
        status = 400;
        errorMessage = 'Sorry, something went wrong with your card. Please try again.';
    }

    if (status === 200 && intent && 'id' in intent) {
        await updateReservation(reservationId, intent.id);
        await createThread(reservationId);
        await blockDates(reservationId);
        await createTransaction(
            reservationId,
            customerEmail,
            customerId,
            intent.id,
            Math.round(amount),
            currency,
            'booking',
            2
        );
        emailBroadcast(reservationId);
    }

    return await {
        status: status,
        errorMessage,
        requireAdditionalAction,
        paymentIntentSecret,
    }
}