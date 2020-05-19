"use strict";
angular.module('xMember').controller('PerformerProfileCtrl', function ($scope, $timeout, $state, Auth, growl, Upload, perfomerService) {
  $('#canvas').css('max-width', $('#max-width').width());
  $scope.model = Auth.getCurrentUser();
  $scope.model.bankFirstName = $scope.model.bankFirstName || $scope.model.firstName;
  $scope.model.bankLastName = $scope.model.bankLastName || $scope.model.lastName;
  $scope.domain = window.location.origin;
  $scope.updateProfile = function(form){
    $scope.submitted = true;
    if (form.$valid) {
      Auth.updateUser($scope.model)
        .then((res) => {
          if(res){
            growl.success("Updated successfully",{ttl:3000});
            //$scope.model.name = res.name;
            //$scope.model.username = res.username;
          }
        }).catch(err => {
          err = err.data;
          this.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, (error, field) => {
            form[field].$setValidity('mongoose', false);
            this.errors[field] = error.message;
          });
        });

    }
  };

  $scope.uploadFiles = function(file, errFiles) {
    $scope.f = file;
    $scope.errFile = errFiles && errFiles[0];
    $scope.MainPhotoUploading = true;
    if (file) {
        Upload.upload({
          url: '/api/v1/performers/avatar',
          method: 'POST',
          file: file
        }).then(function (response) {
            $scope.model.photo = response.data.imageThumbPath;
            $scope.photo = response.data.imageThumbPath;
            $scope.MainPhotoUploading = false;
        }, function (response) {
          if (response.status > 0)
              $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
                                   evt.loaded / evt.total));
        });
    }
  };

  if ($scope.model.idImg1) {
    perfomerService.getIdImage($scope.model.idImg1)
    .then(function(resp) {
      $scope.idFile = resp;
    });
  }

  $scope.uploadFilesId = function(file, errFiles) {
    $scope.f1 = file;
    $scope.IdUploading = true;
    $scope.errFile1 = errFiles && errFiles[0];
    if (file) {
        Upload.upload({
          url: '/api/v1/performers/register/upload',
          method: 'POST',
          file: file
        }).then(function (response) {
             $scope.idPhoto = response.data.fileUrl;
             $scope.model.idImg1 = response.data._id;
             $scope.IdUploading = false;
        }, function (response) {
          if (response.status > 0)
              $scope.errorMsg1 = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
                                   evt.loaded / evt.total));
        });
    }
  };

  $scope.newPassword = '';
  $scope.rePassword = '';
  $scope.changePassword = function(frm) {
    $scope.submitted = true;
    if (!frm.$valid) {
      return growl.error('Something error, please check', {ttl:2000});
    }
    if ($scope.newPassword !== $scope.rePassword) {
      return growl.error('Repassword not match');
    }

    perfomerService.changePassword($scope.newPassword)
    .then(() => {
      growl.success('Password has been updatedd',{ttl:2000});
      $scope.newPassword = '';
      $scope.rePassword = '';
      $scope.submitted = false;
    })
  };

  $scope.uploadFile = function(file, field) {
    $scope.welcomeVideo = file;
    $scope.viUploading = true;
    $scope.uploaded = false;
    Upload.upload({
      url: '/api/v1/files/video-welcome',
      file: file
    }).then(function (response) {
      growl.success('Upload & convert Video successful.', {ttl: 2000});
      $scope.model[field] = response.data.link;
      $scope.viUploading = false;
      $scope.uploaded = true;
    }, function (response) {

    }, function (evt) {
      if (file) {
        file.progress = Math.min(100, parseInt(100.0 *  evt.loaded / evt.total));
      }
    });
  }

  $scope.uploadWelcomePhotoFile = function(file, field) {
    $scope.welcomeFile = file;
    $scope.MainPhotoUploading = true;
    $scope.uploadedCover = false;
    Upload.upload({
      url: '/api/v1/files/upload',
      file: file
    }).then(function (response) {
      growl.success('Uploaded file successful.', {ttl: 2000});
      $scope.MainPhotoUploading = false;
      $scope.uploadedCover = true;
      $scope.model.welcomePhoto = response.data.filePath;
    }, function (response) {

    }, function (evt) {
      if (file) {
        file.progress = Math.min(100, parseInt(100.0 *  evt.loaded / evt.total));
      }
    });
  }


  $scope.cropper = {
    sourceImage: null,
    croppedImage: null
  };
  $scope.bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0

  };

  $scope.crop = function() {
      urltoFile($scope.cropper.croppedImage, 'a.png', 'image/png')
        .then(function(file) {
          $scope.uploadWelcomePhotoFile(file, 'welcomePhoto');
            if ($scope.uploadedCover === true) {
              growl.success("Image have been cropped!",{ttl:3000});
            }
        })
    };

  function urltoFile(url, filename, mimeType) {
      return (fetch(url)
        .then(function(res) {
          return res.arrayBuffer();
        })
        .then(function(buf) {
          return new File([buf], filename, {
            type: mimeType
          });
        })
      );
    };

});