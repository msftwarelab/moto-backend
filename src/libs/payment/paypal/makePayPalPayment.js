import paypal from 'paypal-rest-sdk';
import { getConfigurationData } from '../../../libs/getConfigurationData';


export async function makePayPalPayment(paymentId, payerId) {


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

        var details = { "payer_id": payerId };

        return new Promise(function (resolve, reject) {
            paypal.payment.execute(paymentId, details, async function (error, payment) {
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