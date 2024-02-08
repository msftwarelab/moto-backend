import paypal from 'paypal-rest-sdk';
import { getConfigurationData } from '../../../libs/getConfigurationData';
import { updateReservation, getReservation } from '../stripe/helpers/updateReservation';
import { createTransaction } from '../stripe/helpers/createTransaction';
import { createThread } from '../stripe/helpers/createThread';
import { blockDates } from '../stripe/helpers/blockDates';
import { emailBroadcast } from '../stripe/helpers/email';


const paypalRoutes = app => {

  app.get('/cancel', async function (req, res) {
    res.send({ status: 400, errorMessge: 'cancelled payment' });
  });

  app.get('/success', async function (req, res) {

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

    var paymentId = req.query.paymentId;
    var payerId = req.query.PayerID;
    var details = { "payer_id": payerId };
    paypal.payment.execute(paymentId, details, async function (error, payment) {
      if (error) {
        console.log(error);
        res.send({ status: 400, errorMessge: error });
      } else {
        var amount, payee, item_list, related_resources, rrAmount, rrTranscationFee, itemSKU, transactionId;
        payment.transactions.map((item) => {
          amount = item.amount;
          payee = item.payee;
          item_list = item.item_list;
          related_resources = item.related_resources;
          related_resources.map((relatedItem) => {
            transactionId = relatedItem.sale.id;
            rrAmount = relatedItem.sale.amount;
            if (relatedItem.sale.transaction_fee != undefined) {
              rrTranscationFee = relatedItem.sale.transaction_fee.value;
            }
          })
        })
        item_list.items.map((itemData) => {
          itemSKU = Number(itemData.sku);
        })
        let payerEmail = payment.payer.payer_info.email;
        let payerId = payment.payer.payer_info.payer_id;
        let receiverEmail = payee.email;
        let receiverId = payee.merchant_id;
        let total = rrAmount.total;
        let transactionFee = rrTranscationFee;
        let currency = rrAmount.currency;
        await updateReservation(itemSKU);
        await createTransaction(
          itemSKU,
          payerEmail,
          payerId,
          receiverEmail,
          receiverId,
          transactionId,
          total,
          transactionFee,
          currency,
          ""
        );
        await createThread(itemSKU);
        await blockDates(itemSKU);
        await emailBroadcast(itemSKU);
        let reservation = await getReservation(itemSKU);
        res.send({ status: 200, reservationId, reservation });
      }
    });
  });
};

export default paypalRoutes;