'use strict';
import async from 'async';
import { SettingModel } from '../../models';
import {Skrill} from '../../components';
import { PaymentBusiness } from '../../businesses';
import config from '../../config/environment';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}




exports.doDirectPayment = function(req, res) {
    //get products/package
    PaymentBusiness.getPaymentInfo(req.body)
      .then(transaction => {
        //create skrill token
        transaction.provider = 'skrill';
        if (req.user) {
          transaction.user = req.user._id;
        }else if(req.body.userId){
          transaction.userId = req.body.userId;
        }
        //add transaction
        PaymentBusiness.createTransaction(transaction)
            .then(transaction => {
                Skrill.createToken(transaction)
                    .then(skrill => {
                        //response redirect URl
                        res.status(200).json({redirectUrl: skrill});
                    })
                    .catch(err => {
                        validationError(res, 422)('Skrill can\'t handle post data. Please contact support!');
                    });
            })
            .catch(err => {
                //console.log(err);
                validationError(res, 422)(err);
            });
      })
      .catch(err => {
        handleError(res, 400)(err);
      });
  }



  exports.updateTransaction = function(req, res) {
    //callback
    var userId = req.body['X-userId'] || req.body.userId;
    var type = req.body['X-type'] || req.body.type;
    var packageId = req.body['X-packageId'] || req.body.packageId;
    var subscriptionType = req.body['X-subscriptionType'] || req.body.subscriptionType || packageId;
    var subscriptionId = req.body['X-subscriptionId'] || req.body.subscription_id || req.body.subscriptionId;
    var performerId = req.body['X-performerId'] || req.body.performerId;
    var transactionId = req.body['X-transactionId'] || req.body.transactionId;
    if (!subscriptionId || !transactionId || ['Cancellation', 'RenewalFailure', 'NewSaleFailure'].indexOf(req.query.eventType) > -1) {
      return res.status(200).send({
        ok: true
      });
    }
  
    //'NewSaleSuccess', 'RenewalSuccess' hook
    async.auto({
      transaction(cb) {
        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        if (!checkForHexRegExp.test(transactionId)) {
          return cb();
        }
        TransactionModel.findOne({
          _id: transactionId
        })
        .sort({ createdAt: -1 })
        .exec(cb);
      },
      subscription: ['transaction', function(result, cb) {
        if (result.transaction) {
          return cb(null, result.transaction);
        }
  
        TransactionModel.findOne({
          $or: [{
            'paymentInformation.subscriptionId': subscriptionId
          }, {
            'paymentInformation.subscription_id': subscriptionId
          }]
        })
        .sort({ createdAt: -1 })
        .exec(cb);
      }],
      updatedTransaction: ['subscription', function(result, cb) {
        if (!result.transaction) {
          result.transaction = result.subscription;
        }
        if (!result.transaction) {
          return cb();
        }
  
        if (result.transaction.status === 'completed') {
          return cb(null, result.transaction);
        }
  
        result.transaction.status = 'completed';
        result.transaction.paymentInformation = req.body;
        result.transaction.save(cb);
      }]
    }, function(err, data) {
      if (!data.transaction) {
        data.transaction = data.subscription;
      }
      if (err || !data.transaction) {
        return res.status(200).send({
          ok: false
        });
      }
  
      if (['performer_subscription', 'tip_performer', 'product', 'sale_video'].indexOf(type) === -1) {
        type = data.transaction.type;
      }
      if (['yearly', 'monthly'].indexOf(subscriptionType)) {
        subscriptionType = 'monthly';
      }
  
      if (type === 'performer_subscription') {
        return UserSubscriptionModel.updateUserSubscription({
          userId: userId || data.transaction.userId || data.transaction.user,
          performerId: performerId || data.transaction.performerId,
          subscriptionType: subscriptionType || 'monthly',
          transaction: data.transaction.toObject()
        }, function(err) {
          res.status(200).send({
            ok: true
          });
        });
      } else if (type === 'tip_performer') {
        return EarningModel.addTip({
          userId: userId || data.transaction.userId || data.transaction.user,
          performerId: data.transaction.performerId,
          price: data.transaction.price
        }, function() {
          res.status(200).send({
            ok: true
          });
        });
      } else if (type === 'product') {
        return updateProductTransaction(data.transaction, function(err) {
          if (err) {
            return res.status(400).send(err);
          }
          res.status(200).send({
            ok: true
          });
        })
      } else if (type === 'sale_video') {
        return updateSaleVideo(data.transaction, function(err) {
          if (err) {
            return res.status(400).send(err);
          }
          res.status(200).send({
            ok: true
          });
        })
      } else {
        res.status(200).send({
          ok: true
        });
      }
    });
  }


