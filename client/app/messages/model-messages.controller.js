(function (angular) {
  'use strict';

  angular.module('xMember').controller('ModelMessagesCtrl', ModelMessagesCtrl);

  function ModelMessagesCtrl($scope, $state, $stateParams, messageService, perfomerService, socket, user, performers, growl, Upload) {
    $scope.user = user;
    async.waterfall([
      function(cb) {
        angular.forEach(performers.data, function(performer) {
          if(user._id != performer._id) {
            messageService.getGroup({recipientId: performer._id, type: 'model'});
          }
        });
        cb();
      }
    ], function () {
          messageService.findAllGroups({type: 'model'}).then((res) =>{
            $scope.groups = res;
             if ($scope.groups.length > 0 || $stateParams.recipientId) {
               $scope.activeGroup = _.find($scope.groups, function(group) {
                 return _.find(group.users, function(u) {
                   return u._id === $stateParams.recipientId;
                 });
               });
             }
          });
    });

    $scope.activeGroup = null;

    $scope.getRecipient = function(group) {
      return _.find(group.users, gUser => gUser._id !== user._id);
    };

    $scope.setActiveGroup = function(group) {
      $scope.activeGroup = group;
    };

  }
})(angular);
