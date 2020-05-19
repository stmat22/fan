angular.module('xMember').controller('NavbarController', function ($scope, Auth, settingService) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.getCurrentUser = Auth.getCurrentUser;
  if(typeof $scope.getCurrentUser().photo == 'undefined'){
    $scope.avatar = "assets/images/avatar5.jpg";
  }else{
    $scope.avatar = $scope.getCurrentUser().photo;
  }
  settingService.getDefault().then(function(data){
    $scope.setting =  data.data;
  });
});

