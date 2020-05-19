"use strict";
angular.module('xMember').controller('LoginController', function ($scope, $state, $window, $cookies, Auth, growl) {
   // var windowHeight = $(window).height();
   //  $('.login-page-cus').css('height',windowHeight);
   $(document).ready(function () {
     var show = false;
       $('.switch-tab #model').click(function () {
           $('.switch-tab #model').addClass( "active");
           $('.switch-tab #member').removeClass( "active");
           $('.benefit-listing#tab-model').addClass( "active");
           $('.benefit-listing#tab-member').removeClass('active');
       });
       $('.switch-tab #member').click(function () {
           $('.switch-tab #member').addClass( "active");
           $('.switch-tab #model').removeClass( "active");
           $('.benefit-listing#tab-member').addClass( "active");
           $('.benefit-listing#tab-model').removeClass('active');
       });
    });

    $scope.user = {
      email: null,
      password: null,
      rememberMe: null
    };
    $scope.performer = {
      email: null,
      password: null,
      rememberMe: null
    };

    $scope.errors = {};
    $scope.submitted = false;

  $scope.loginUser = function(form){
  $scope.submitted = true;
  if (form.$valid) {
     Auth.login($scope.user).then(function(res){
       var redirectUrl = $cookies.get('redirectUrl');
       if (redirectUrl) {
         $cookies.remove('redirectUrl');
       }
       $window.location.href  = redirectUrl || '/feed';
     }).catch(function(err){
       $scope.errors.other = err.message;
     });
    }
   };
   $scope.errors1 = {};
   $scope.submitted1 = false;
   $scope.loginPerformer = function(form){
     $scope.submitted1 = true;

     if (form.$valid) {
      Auth.loginPerformer($scope.performer).then(function(res){
        var redirectUrl = $cookies.get('redirectUrl');
        if (redirectUrl) {
          $cookies.remove('redirectUrl');
          $window.location.href  = redirectUrl;
        } else {
          $state.go('modelView', {id: res.username});
        }
      }).catch(function(err){
        growl.error(err.message);
      });
     }
   };
});
