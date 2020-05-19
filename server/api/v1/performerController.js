'use strict';

import { PerformerModel, FileModel, ProfileView, LikeModel, VideoModel } from '../../models';
import { PerformerBusiness } from '../../businesses';
import { PerformerValidator, parseJoiError } from '../../validators';
import passport from 'passport';
import config from '../../config/environment';
import { S3, GM, Uploader, AWSS3 } from '../../components';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
let dateChunk = require('chunk-date-range');
import moment from 'moment-timezone';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

class PerformerController {
  /**
   * Get list of Performers
   */
  static index(req, res) {
    if(req.query.limit!='undefined'){
        req.query.limit = parseInt(req.query.limit);
    }
    if(req.query.limit>50){
        req.query.limit = 50;
    }
    if(req.query.offset!='undefined'){
        req.query.offset = parseInt(req.query.offset);
    }
    return PerformerBusiness.find(req.query)
      .then(performers => {
        if (!_.isArray(performers)) {
          return res.status(200).json(performers);
        }

        let i = 0;
        let privatePerformers = [];
        performers.forEach(item => {
        i++;
        item = _.omit(item.toObject(), ['email', 'bankDateofBirth', 'bankFirstName', 'bankLastName', 'bankLegalType',
          'bankBusinessTaxId', 'bankBusinessTitle', 'bankCountry', 'bankSsn', 'bankState', 'bankCity', 'bankAddress', 'bankName',
          'bankAccount', 'bankSwiftCode', 'bankRounding', 'bankBankAddress', 'bankZip', 'tipCommision', 'subscriptionCommision',
        'storeComission', 'ccbill', 'privateStreamTokenPerMinute', 'salt', 'password']);
        privatePerformers.push(item);
        });
        if(i === performers.length) {
          res.status(200).json(privatePerformers);
        }
      })
      .catch(handleError(res));
  }

  /**
   * Creates a new Performer
   */
  static create(req, res, next) {
    PerformerValidator.validateCreating(req.body).then(data => {
      PerformerBusiness.create(data,req.user).then(function(performer) {
        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }

            performer.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              _.merge(performer, result);
              cb();
            });
          }
        ], function() {
          if (!req.files.file) {
            return res.status(200).send(performer);
          }

          PerformerBusiness.update(performer)
          .then((performer) => res.status(200).json(performer))
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Get a single Performer
   */
  static show(req, res, next) {
    let query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { username: req.params.id.toLowerCase() }

    PerformerBusiness.findOne(query)
    .then(performer => {
      if (!performer) {
        return res.status(404).end();
      }

        if (performer.welcomeVideo && config.fileType === 's3') {
          performer.welcomeVideo = AWSS3.getSignedUrl(performer.welcomeVideo);
        }

        let privateInfo = _.omit(performer.toObject(), ['email', 'bankDateofBirth', 'bankFirstName', 'bankLastName', 'bankLegalType',
          'bankBusinessTaxId', 'bankBusinessTitle', 'bankCountry', 'bankSsn', 'bankState', 'bankCity', 'bankAddress', 'bankName',
          'bankAccount', 'bankSwiftCode', 'bankRounding', 'bankBankAddress', 'bankZip', 'tipCommision', 'subscriptionCommision',
        'storeComission', 'ccbill', 'privateStreamTokenPerMinute', 'salt', 'password']);

      res.status(200).json(privateInfo);
      })
      .catch(err => next(err));
  }

  /**
   * Get a single Performer by admin
   */
  static showAdmin(req, res, next) {
    if(req.user.role !== 'admin') {
      return res.status(403).end();
    }
    let query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { username: req.params.id.toLowerCase() }

    PerformerBusiness.findOne(query)
      .then(performer => {
        if (!performer) {
          return res.status(404).end();
        }

        if (performer.welcomeVideo && config.fileType === 's3') {
          performer.welcomeVideo = AWSS3.getSignedUrl(performer.welcomeVideo);
        }

      res.json(performer);
      })
      .catch(err => next(err));
  }

  static checkAllow (req, res) {
    PerformerModel.count({
      allowIds: {
        $in: [req.query.objectId]
      },
      _id: req.query.userId
    }, function(err, count) {
      let allowed = !err && count;
      res.status(200).send({ allowed });
    });
  }

  static findOneMiddleware(req, res, next) {
    let id = req.params.id || req.query.performerId || req.query.performer || req.query.id;
    if (!id) {
      return next();
    }

    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { username: id.toLowerCase() }

    PerformerBusiness.findOne(query)
    .then(performer => {
      if (performer) {
        if (performer.welcomeVideo && config.fileType === 's3') {
          performer.welcomeVideo = AWSS3.getSignedUrl(performer.welcomeVideo);
        }
        req.performer = performer;
      }

      next();
    })
    .catch(err => next(err));
  }

 /**
   * Get a single Performer
   */

  static update(req, res, next) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    PerformerValidator.validateUpdating(req.body).then(data => {
      return PerformerBusiness.findOne(condition).then(performer => {
        if (!performer) {
          return re.status(404).send();
        }
        _.assign(performer, _.pick(req.body, [
          'username','name', 'performer', 'description', 'sort', 'sexualPreference', 'age', 'sex', 'weight', 'height',
          'hair', 'eyes', 'ethnicity', 'languages', 'hometown', 'publicHair', 'bust', 'status',
          'type', 'email', 'bankDateofBirth', 'bankFirstName', 'bankLastName', 'bankCompany',
          'bankBusinessTaxId', 'bankBusinessTitle', 'bankCountry', 'bankSsn',
          'bankState', 'bankCity', 'bankAddress', 'bankAddress2', 'bankZip', 'bankName',
          'bankAccount', 'bankRounding', 'bankSwiftCode', 'bankBankAddress',
          'isVerified', 'subscriptionMonthlyPrice','showHome', 'firstName', 'lastName',
          'tipCommision', 'subscriptionCommision', 'storeComission', 'ccbill', 'skrill', 'allowIds', 'autoPostTwitter' //vuln! conditional user.role == admin for admin commands
        ]));
        if (req.body.password) {
          performer.password = req.body.password;
        }

        async.waterfall([
          function(cb) {
            if (!req.files.file) {
              return cb();
            }

            performer.imageType = config.imageType;
            let Func = config.imageType == 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
            Func(req.files.file, req.user._id, function(err, result) {
              if (err) {
                return res.status(400).send(err);
              }

              _.merge(performer, result);
              cb();
            });
          }
        ], function() {
          PerformerBusiness.update(performer)
          .then((performer) => res.status(200).json(performer))
        });
      });
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  /**
   * Deletes a Performer
   */
  static destroy(req, res) {
    var condition = {
      _id: req.params.id
    }
    if(req.user.role !== 'admin') {
      condition.user = req.user._id;
    }
    PerformerBusiness.findOne(condition).then(
      performer => {
        if(!performer) {
          return res.status(404,'Not found').end();
        }
        performer.remove();
        res.status(200,true).end();
      },
      err => handleError(res)
    );
  }

  static search(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;

    let query = {
      status: 'active',
      $and: []
    };
    if (req.query.keyword) {
      let regex = new RegExp(req.query.keyword, 'i');
      query.$and.push({
        $or: [
          {
            name: regex
          },
          // {
          //   description: regex
          // }
        ]
      })
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    let sort = { sort: 1, createdAt: -1 };
    if (req.query.sort && ['recent', 'popular', 'rate'].indexOf(req.query.sort) > -1) {
      if (req.query.sort === 'recent') {
        sort = { createdAt: -1 };
      } else if (req.query.sort === 'popular') {
        sort = { totalView: -1 };
      } else if (req.query.sort === 'rate') {
        sort = { sort: -1, totalView: -1 };
      }
    }

    if(req.query.sortBy === 'name') {
      sort = { name: 1 };
    }

    if (!query.$and.length) {
      delete query.$and;
    }

    async.parallel({
      items(cb) {
        PerformerModel.find(query)
          .sort(sort)
          .skip(page * take)
          .limit(take)
          .exec(cb);
      },
      count(cb) {
        PerformerModel.count(query, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      let i = 0;
      let privatePerformers = [];
      if (result.items.length) {
        result.items.forEach(item => {
          i++;
          item = _.omit(item.toObject(), ['email', 'bankDateofBirth', 'bankFirstName', 'bankLastName', 'bankLegalType',
            'bankBusinessTaxId', 'bankBusinessTitle', 'bankCountry', 'bankSsn', 'bankState', 'bankCity', 'bankAddress', 'bankName',
            'bankAccount', 'bankSwiftCode', 'bankRounding', 'bankBankAddress', 'bankZip', 'tipCommision', 'subscriptionCommision',
          'storeComission', 'ccbill', 'privateStreamTokenPerMinute', 'salt', 'password']);
          privatePerformers.push(item);
        });
        if (i === result.items.length) {
          result.items = privatePerformers;
          res.status(200).send(result);
        }
      }else {
        res.status(200).send(result);
      }
    });
  }

  /**
  * register as a performer
  */
  static register(req, res) {
    //TODO - validate me
    //check email exists and create new performer
    async.auto({
      performer(cb) {
        PerformerModel.findOne({ email: req.body.email }, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }

      if (result.performer) {
        return res.status(400).send({
          message: 'This email has been registered!'
        });
      }

      if(typeof req.body.tags !== 'undefined')
        req.body.tags=req.body.tags.split(',').map(str => str.replace(/[^\w-]+/g, ' ').replace(/ +/g, ' ').trim()).filter(s => s);

      let model = new PerformerModel(_.pick(req.body, ['email', 'name', 'password', 'idImg1', 'idImg2', 'sex', 'skrill', 'firstName', 'lastName', 'phone', 'description', 'subscriptionDailyPrice', 'subscriptionWeeklyPrice', 'subscriptionMonthlyPrice', 'notesForTeam', 'welcomePhoto', 'tags', 'imageFullPath', 'imageThumbPath', 'imageMediumPath']));
      model.type = 'registered';
      model.save(err => {
        if (err) {
          return res.status(500).send(err);
        }

        res.status(200).send({
          message: 'Your account has been created. Please wait to verify!'
        });
      });
    });
  }

  static uploadVerifyImage(req, res) {
    let file = req.file;
    let newFile = new FileModel({
      name: file.originalname,
      path: file.filename, //original papth
      mimeType: file.mimetype
    });

    newFile.save(function(err, updated) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send(updated);
    });
  }

  static uploadAvatar(req, res) {
    var Func = config.imageType === 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
    Func(req.file, 'performers', (err, result) => {
      _.merge(req.user, result);

      req.user.save((err, updated) => res.status(200).send(updated));
    });
  }

  static newAccountAvatar(req, res) {
    var Func = config.imageType === 's3' ? Uploader.uploadImageWithThumbnailsToS3 : Uploader.uploadImageWithThumbnails;
    Func(req.file, 'performers', (err, result) => {
      res.status(200).send(result);
    },res);
  }

  static updatePassword(req, res) {
    // @E-TODO
    PerformerValidator.validateCreating(req.body).then(data => {
      if (!req.body.password) {
        return res.status(400).end();
      }
  
      req.user.password = req.body.password;
      req.user.save(err => res.status(200).send());
    })
    .catch(err => validationError(res, 422)(parseJoiError(err)));
  }

  static getIdFile(req, res) {
    FileModel.findOne({
      _id: req.params.id
    }, function(err, file) {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(200).send(file);
    });
  }

  static addViewCount(req, res) {
    let query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { username: req.params.id.toLowerCase() }
    async.auto({
      performer(cb) {
        PerformerModel.findOne(query, cb);
      },
      profileView: ['performer', (result, cb) => {
        if (!result.performer) {
          return cb();
        }
        let item = new ProfileView({
          userId: req.user ? req.user._id : null,
          performerId: result.performer._id
        });

        item.save(cb);
      }],
      updateCount: ['performer', (result, cb) => {
        if (!result.performer) {
          return cb();
        }
        PerformerModel.update({
          _id: result.performer._id
        }, {
          $inc: {
            totalView: 1
          }
        })
        .exec(cb);
      }]
    }, function() {
      res.status(200).send();
    });
  }

  static leaderboards(req, res) {
    let page = Math.max(0, req.query.page - 1); // using a zero-based page index for use with skip()
    let take = parseInt(req.query.take) || 12;

    let query = {
      status: 'active',
      $and: []
    };
    if (req.query.showHome) {
      query.showHome = true;
    }

    if (req.query.keyword) {
      let regex = new RegExp(req.query.keyword, 'i');
      query.$and.push({
        $or: [
          {
            name: regex
          },
          // {
          //   description: regex
          // }
        ]
      })
    }

    if (!query.$and.length) {
      delete query.$and;
    }

    async.parallel({
      items(cb) {
        let sort = { totalSubscriber: -1, totalView: -1 };
        if (req.query.sort) {
          sort[req.query.sort] = -1;
        }
        PerformerModel.find(query)
          .sort(sort)
          .skip(page * take)
          .limit(take)
          .exec(cb);
      },
      count(cb) {
        PerformerModel.count(query, cb);
      }
    }, function(err, result) {
      if (err) {
        return res.status(500).send(err);
      }
      let i = 0;
      let privatePerformers = [];
      if (result.items.length) {
        result.items.forEach(item => {
          i++;
          item = _.omit(item.toObject(), ['email', 'bankDateofBirth', 'bankFirstName', 'bankLastName', 'bankLegalType',
            'bankBusinessTaxId', 'bankBusinessTitle', 'bankCountry', 'bankSsn', 'bankState', 'bankCity', 'bankAddress', 'bankName',
            'bankAccount', 'bankSwiftCode', 'bankRounding', 'bankBankAddress', 'bankZip', 'tipCommision', 'subscriptionCommision',
          'storeComission', 'ccbill', 'privateStreamTokenPerMinute', 'salt', 'password']);
          privatePerformers.push(item);
        });
        if (i === result.items.length) {
          result.items = privatePerformers;
          res.status(200).send(result);
        }
      }else {
        res.status(200).send(result);
      }
    });
  }

  static profileViewStats(req, res) {
    let startDate = req.query.startDate ? moment(req.query.startDate).tz('America/New_York').toDate() : moment().add(-7, 'days').toDate();
    let endDate = req.query.endDate ? moment(req.query.endDate).tz('America/New_York').endOf('day').toDate() : new Date();

    let chunks = dateChunk(startDate, endDate, 'day');
    let data = [];
    async.eachSeries(chunks, function(chunk, cb) {
      ProfileView.count({
        performerId: req.user._id,
        createdAt: {
          $lt: chunk.end,
          $gt: chunk.start
        }
      }, function(err, count) {
        data.push({
          start: chunk.start,
          end: chunk.end,
          count: err ? 0 : count
        });

        cb();
      });
    }, function() {
      res.status(200).send(data);
    });
  }

  static likeStats(req, res) {
    let startDate = req.query.startDate ? moment(req.query.startDate).tz('America/New_York').toDate() : moment().add(-7, 'days').toDate();
    let endDate = req.query.endDate ? moment(req.query.endDate).tz('America/New_York').endOf('day').toDate() : new Date();

    let chunks = dateChunk(startDate, endDate, 'day');
    let data = [];
    async.waterfall([
      function(cb) {
        VideoModel.find({
          performer: {
            $in: [req.user._id]
          }
        }, function(err, videos) {
          if (err) {
            return cb(err);
          }

          return cb(null, _.map(videos, v => v._id));
        });
      },
      function(videoIds, cb) {
        var data = [];
        async.eachSeries(chunks, function(chunk, cb) {
          LikeModel.count({
            video: {
              $in: videoIds
            },
            createdAt: {
              $lt: chunk.end,
              $gt: chunk.start
            }
          }, function(err, count) {
            data.push({
              start: chunk.start,
              end: chunk.end,
              count: err ? 0 : count
            });

            cb();
          });
        }, function() {
          cb(null, data);
        });
      }
    ], function(err, data) {
      if (err) {
        return handleError(res);
      }

      res.status(200).send(data);
    });
  }
}

module.exports = PerformerController;
