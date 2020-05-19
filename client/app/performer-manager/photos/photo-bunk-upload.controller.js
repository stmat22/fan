'use strict';

angular.module('xMember').controller('PhotoBulkUploadCtrl', function ($scope, $state, perfomerService, photoService, growl, Upload, performer) {
  $scope.fileSelect = [];
  $scope.files = [];
  $scope.selectedPerformers = [];
  $scope.select2Options = {
    'multiple': true,
    'simple_tags': true
  };
  
  $scope.populateFile = function(files) {
    _.map(files, function(file) {
      file.data = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        status: 'active',
        performer: [performer._id]
      };
      $scope.files.push(file);
    });
  };

  $scope.remove = function(file, index) {
    $scope.files.splice(index);
  };

  $scope.uploadAll = function() {
    $scope.uploading = true;
    async.eachSeries($scope.files, function(file, cb) {
      var data = file.data;
      file.uploading = true;
      Upload.upload({
        url: '/api/v1/photos',
        method: 'POST',
        data: file.data,
        file: [file]
      }).then(function (response) {
        file.uploaded = true;
        file.uploading = false;
        cb();
      }, function (response) {
      }, function(evt) {
        file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        $scope.safeApply();
      });
    }, function() {
      $scope.uploading = false;
      growl.success('Upload done', { ttl: 3000 });
      $state.go('manager.photos');
    });
  };

  $scope.cancel = function() {
    $state.go('manager.photos');
  };
});
