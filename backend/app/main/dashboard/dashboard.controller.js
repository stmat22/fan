angular.module('xMember').controller('DashBoardCrtl', function ($scope, $timeout, $state, Auth, growl, videoCount, performerCount, userCount, orderCount) {
  $scope.videoCount = videoCount;
  $scope.performerCount = performerCount;
  $scope.userCount = userCount;
  $scope.orderCount = orderCount;
});
