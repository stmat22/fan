'use strict';
import config from '../config/environment';
import request from 'request';
const ipnUrl = config.baseUrl + 'api/v1/skrill/callback';
const productReturnUrl = config.baseUrl + 'payment-thanks';
const productCancelUrl = config.baseUrl + 'payment-cancel';

  let httpOptions = {};
  let baseUrl = "https://pay.skrill.com";

function createToken(transaction, options){
      options = options || {};
      return new Promise((resolve, reject) => {
        if(transaction.coupon && transaction.coupon._id){
          let price = 0;
          if(transaction.coupon.discountType === 'amount'){
            price = -transaction.coupon.discountValue;
          }else{
            price = -parseFloat((transaction.price * transaction.coupon.discountValue)/100).toFixed(2);
          }
          transaction.price += price;
        }
        let invoiceOptions = {
            pay_to_email: 'demoqcoflexible@sun-fish.com',
            amount: transaction.price,
            currency: 'EUR',
            return_url: productReturnUrl,
            return_url_target: 2,
            cancel_url: productCancelUrl,
            cancel_url_target: 2,
            status_url: ipnUrl,
            user_id: (transaction.user || transaction.userId).toString(),
            prepare_only: 1,
            recipient_description: 'Lazarus Trading S.L',
            payment_methods: '',
            transaction_id: transaction._id.toString(),
            pay_from_email: '',
            detail1_description: 'Payment Reference :',
            detail1_text: transaction._id.toString() // transaction.description
        };
        /*
        if(transaction.userId){
          invoiceOptions.return_url = packageReturnUrl;
        }
        */
        let options = new Object(httpOptions);
        options.method = "POST";
        options.url = baseUrl+"/";
        options.form = invoiceOptions;

        request(options, function(err, resp, body) {
          if (parseInt(resp.statusCode) !== 200) {
            reject(body);
          } else {
            resolve(baseUrl+"/?sid="+body);
          }
        });
      });
    }

function getExpressCheckoutDetails(invoiceId){
      return new Promise((resolve, reject) => {
        let options = new Object(httpOptions);
        options.url = baseUrl+'/api/invoice/'+invoiceId;
        options.methd = 'GET';
        request(options, function(err, resp, body) {
          let result = JSON.parse(body);
          if (result.error) {
            reject(result.error);
          } else {
            result.transactionId = result.posData;
            result.paymentStatus = result.status;
            result.status = 'failed';
            if (result.paymentStatus === 'confirmed') {
              result.status = 'completed'
            } else if (result.paymentStatus === 'paid') {
              result.status = 'pending'
            }
            resolve(result);
          }
        });
      });
    }
  
module.exports.getExpressCheckoutDetails = getExpressCheckoutDetails;
module.exports.createToken = createToken;