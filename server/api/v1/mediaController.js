'use strict';

import { PhotoModel, PerformerAlbumModel, VideoModel } from '../../models';
import { UserSubscriptionModel, UserModel, SettingModel, PerformerModel } from '../../models';
import { PhotoBusiness, VideoBusiness, MediaBusiness, UserBusiness } from '../../businesses';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import async from 'async';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
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

class MediaController {
  
  static search(req, res, $scope) {
    let skipImages=parseInt(req.query.photosStartAt) || 0;
    let skipVideos=parseInt(req.query.videosStartAt) || 0;
    let per_page=Math.min(parseInt(req.query.perPage) || 0, 50) || 10;
    let ObjectId = require('mongoose').Types.ObjectId;
    $scope.searchFilters={
      performer: [],
      status: 'active'
    };
    let performs = [];
    if(req.query.getSuscribedPerformersFeed){
      UserSubscriptionModel.find({
        userId: req.user._id,
        expiredDate: {
          $gt: new Date()
        }
      }, function(err, list) {
        if (err) {
          return res.status(403).send();
        }
        list.push({
          performerId: req.user._id,
          userId: req.user._id
        });
        list.forEach((item) => {
          performs.push(item.performerId.toString());
        });
        $scope.searchFilters.performer={$in: performs};
        PhotoModel.find($scope.searchFilters).populate("performer").skip(skipImages).limit(per_page).then(photos => {
          VideoModel.find($scope.searchFilters).populate("performer").skip(skipVideos).limit(per_page).then(videos => {
            res.status(200).json([...videos, ...photos].sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1).slice(0, per_page));
          });
        });
      })
    }
    if(req.query.getPerformerFeed){
      if (req.user.role !== 'admin' || req.query.performerId !== req.user._id) {
        UserSubscriptionModel.count({
          userId: req.user._id,
          performerId: req.query.performerId,
          expiredDate: {
            $gt: new Date()
          }
        }, function(err, count) {
          console.log(err,count);
            let subscribed = !err && count;
            if(req.query.performerId.toString() !== req.user._id.toString() && !subscribed) {
              return res.status(403).send();
            }

            $scope.searchFilters.performer={$in: [req.query['performerId'].toString()]};
            PhotoModel.find($scope.searchFilters).populate("performer").skip(skipImages).limit(per_page).then(photos => {
              VideoModel.find($scope.searchFilters).populate("performer").skip(skipVideos).limit(per_page).then(videos => {
                res.status(200).json([...videos, ...photos].sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1).slice(0, per_page));
              });
            });
          })
      }else{
        console.log($scope.searchFilters);
        $scope.searchFilters.performer={$in: [req.query['performerId']]};
        PhotoModel.find($scope.searchFilters).skip(skipImages).limit(per_page).then(photos => {
          VideoModel.find($scope.searchFilters).skip(skipVideos).limit(per_page).then(videos => {
            res.status(200).json([...videos, ...photos].sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1).slice(0, per_page));
          });
        });
      }
    }

  }
  
}

module.exports = MediaController;