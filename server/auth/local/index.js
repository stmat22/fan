'use strict';

import express from 'express';
import passport from 'passport';
import { signToken } from '../auth.service';
import { PerformerModel } from '../../models';

var router = express.Router();

router.post('/', function(req, res, next) {
  if (req.body.type === 'performer') {
    if (!req.body.email) {
      return res.status(400);
    }

    return PerformerModel.findOne({
      email: req.body.email.toLowerCase()
    }, function(err, performer) {
      if (err || !performer || !performer.isVerified || performer.status === 'inactive') {
        let msg="Please check your username and password";
        if(performer && performer.status === 'inactive')
          msg = "Your account is pending activation";
        return res.status(401).json({message: msg});
      }

      performer.authenticate(req.body.password, function(err, isCorrect) {
        // console.log(req.body.password)
        // console.log(isCorrect)
        if (err || !isCorrect) {
          return res.status(401).json({message: "Please check your username and password"});
        }

        var token = signToken(performer._id, 'performer');
        res.json({ token });
      });
    });
  }


  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
//    if(user.role=='admin'){
//      return res.status(404).json({message: 'Your role is admin. Please create new account.'});
//    }
    var token = signToken(user._id, user.role);
    res.json({ token });
  })(req, res, next);
});

export default router;
