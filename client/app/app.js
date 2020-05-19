'use strict';

window.isURL = function(str) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
};

angular.module('xMember', ['xMember.auth', 'xMember.admin', 'xMember.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap',
    'validation.match', 'angular-growl', 'bootstrapLightbox', 'angular-md5',
    'angular-loading-bar', 'ngAnimate', 'ngFileUpload', 'ngCart', 'vjs.video', 'ui.calendar',
     'ui.select', 'ui.carousel', 'ui.select2','luegg.directives', 'daterangepicker', 'chart.js', 'angular-img-cropper'
  ])
  .constant('SITENAME', 'Xfans')
  .config(function($urlRouterProvider,  LightboxProvider, $locationProvider,  cfpLoadingBarProvider) {
    $urlRouterProvider.otherwise('/');
    LightboxProvider.fullScreenMode = true;
    $locationProvider.html5Mode(true);
    //angular loading bar
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = true;

  })
  .run(function ($rootScope, settingService, $state, cfpLoadingBar, $anchorScroll, $window, $cookieStore, $sce, appConfig) {
    cfpLoadingBar.start();
    /*
     *scroll to top when state changed
     */

    var wrap = function(method) {
      var orig = $window.window.history[method];
      $window.window.history[method] = function() {
        var retval = orig.apply(this, Array.prototype.slice.call(arguments));
        $anchorScroll();
        return retval;
      };
    };
    wrap('pushState');
    wrap('replaceState');
    /*End scroll to top*/
    settingService.find().then(function(data){
      /*
      data.data.welcomeContent = $sce.trustAsHtml(data.data.welcomeContent);
      data.data.landingPageContent = $sce.trustAsHtml(data.data.landingPageContent);
      data.data.footerContent = $sce.trustAsHtml(data.data.footerContent);
*/
      $rootScope.setting = data.data;
    });

    $rootScope.safeApply = function(fn) {
      var phase = $rootScope.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof (fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    $rootScope.appConfig = appConfig;
  })
  .value('$', $);
