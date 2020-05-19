'use strict';

angular.module('xMember').controller('SignupPerformerCtrl', function($scope, $state, Auth, growl, Upload) {
  Auth.getCurrentUser(function(user) {
    if(user.role === 'performer'){
      document.location = '/'+user.username;
    }
    if(user.role === 'user'){
      $state.go('feed');
    }
  });
  $('.login-page').css('height', $(window).height());
  $scope.domain = window.location.origin;

  $scope.user = {
    sex: 'female'
  };
  $scope.file;


  $scope.uploadCoverPhotoFile = function(file, errFiles) {
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
             $scope.model.welcomePhoto = response.data._id;
        }, function (response) {
          if (response.status > 0)
              $scope.errorMsg1 = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
                                   evt.loaded / evt.total));
        });
    }
  };

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
          uploadWelcomePhotoFile(file, 'welcomePhoto');
            if ($scope.uploadedCover === true) {
              growl.success("Image have been cropped!",{ttl:3000});
            }
        })
    };

    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }


  $scope.submit = function(frm) {
    $scope.submitted = true;
    if (!$scope.file) {
      return;
    }
    if (frm.$valid) {
      Upload.upload({
        url: '/api/v1/performers/register/upload',
        data: {
          file: $scope.file
        }
      }).then(function (id1) {
        Upload.upload({
          url: '/api/v1/performers/register/upload',
          data: {
            file: $scope.file2
          }
        }).then(function (id2) {
          Upload.upload({
            url: '/api/v1/performers/register/upload',
            data: {
              file: $scope.welcomePhoto
            }
          }).then(function (welcomePhoto) {
            let avatar=dataURLtoFile($scope.cropper.croppedImage, 'a.png');
            Upload.upload({
              url: '/api/v1/performers/newAccountAvatar',
              data: {
                file: avatar
              }
            }).then(function (newAccountAvatar) {
              Auth.registerPerformer(Object.assign($scope.user, {
                  imageFullPath: newAccountAvatar.data.imageFullPath,
                  imageMediumPath: newAccountAvatar.data.imageMediumPath,
                  imageThumbPath: newAccountAvatar.data.imageThumbPath,
                  welcomePhoto: '/uploads/files/'+welcomePhoto.data.path,
                  idImg1: id1.data._id,
                  idImg2: id2.data._id
                }))
                .then(updated => {
                  growl.success(updated.message);
                  $scope.user = {
                    sex: 'female'
                  };
                  $scope.submitted = false;
                })
                .catch(err => growl.error(err.data.message));
            }, function () {
              growl.error('Cannot upload profile banner, please double check!');
            });
          }, function () {
            growl.error('Cannot upload profile picture, please double check!');
          });
        }, function () {
          growl.error('Cannot upload ID Verification, please double check!');
        });
      }, function () {
        growl.error('Cannot upload ID , please double check!');
      });
    }


  };
});
