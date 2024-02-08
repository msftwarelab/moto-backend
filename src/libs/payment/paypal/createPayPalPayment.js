import paypal from 'paypal-rest-sdk';
import { getConfigurationData } from '../../../libs/getConfigurationData';
import { payment } from '../../../config';

export async function createPayPalPayment(listTitle, reservationId, total, currency) {


  try {

     let configData = await getConfigurationData({ name: ['paypalEmail', 'paypalClientId', 'paypalSecret', 'paypalHostMode', 'paypalHost'] });

     var paymentConfig = {
      "api": {
          "host": configData.paypalHost,
          "mode": configData.paypalHostMode,
          "port": '',
          "client_id": configData.paypalClientId,  // your paypal application client id
          "client_secret": configData.paypalSecret // your paypal application secret id
      }
  }

    paypal.configure(paymentConfig.api);

    let amount = total.toFixed(2);
    var paymentDetails = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": payment.paypal.returnURL,
        "cancel_url": payment.paypal.cancelURL + '?id=' + reservationId
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": listTitle,
            "sku": reservationId.toString(),
            "price": amount.toString(),
            "currency": currency,
            "quantity": 1
          }]
        },
        "amount": {
          "currency": currency,
          "total": amount.toString()
        },
        "description": "This is the payment description."
      }]
    };

    return new Promise(function (resolve, reject) {
      paypal.payment.create(paymentDetails, function (error, payment) {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      })
    });

  } catch (error) {
    return {
      status: 400,
      errorMessage: error
    }
  }
}