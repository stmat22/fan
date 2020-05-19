'use strict';

angular.module('xMember')
  .config(function($stateProvider) {
    $stateProvider.state('landing', {
      url: '/',
      templateUrl: 'app/account/dashboard.html',
      data: {
        pageTitle: 'Signup',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });

    $stateProvider.state('feed', {
      url: '/feed',
      templateUrl: 'app/main/home/index.html',
      controller: 'HomeCtrl',
      data: {
        pageTitle: 'Home',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('contact', {
      url: '/contact',
      templateUrl: 'app/main/contact/index.html',
      controller: 'ContactCtrl',
      data: {
        pageTitle: 'Contact',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('cart', {
      url: '/cart',
      templateUrl: 'app/main/store/cart.html',
      controller: 'CartCtrl',
      data: {
        pageTitle: 'Cart',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });

    $stateProvider.state('profile', {
      url: '/account-information',
      templateUrl: 'app/main/profile/index.html',
      controller: 'ProfileCtrl',
      data: {
        pageTitle: 'Account Information',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });

    $stateProvider.state('notifications', {
      url: '/notifications',
      templateUrl: 'app/main/profile/notifications.html',
      controller: 'NotificationCtrl',
      data: {
        pageTitle: 'Notifications',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });

    $stateProvider.state('favorites', {
      url: '/favorites',
      templateUrl: 'app/main/profile/favorite.html',
      controller: 'FavoriteCtrl',
      data: {
        pageTitle: 'Favorites Video',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
       me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        },
       videos: function(saveVideoService){
         return saveVideoService.findAll('favorites',6,0).then(function(data){
            return data.data;
          });
        },
        videoCount: function(saveVideoService){
         return saveVideoService.findAll('favorites').then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('watchLater', {
      url: '/watch-later',
      templateUrl: 'app/main/profile/watch_later.html',
      controller: 'WatchLaterCtrl',
      data: {
        pageTitle: 'Watch Later Video',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
        me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        },
       videos: function(saveVideoService){
         return saveVideoService.findAll('watchlater',6,0).then(function(data){
            return data.data;
          });
        },
        videoCount: function(saveVideoService){
         return saveVideoService.findAll('watchlater').then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('downloaded', {
      url: '/downloaded-items',
      templateUrl: 'app/main/profile/downloaded.html',
      controller: 'DownloadedCtrl',
      data: {
        pageTitle: 'Downloaded Video',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
       me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('purchased', {
      url: '/purchased-items',
      templateUrl: 'app/main/profile/purchased.html',
      controller: 'PurchasedCtrl',
      data: {
        pageTitle: 'Purchased Items',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('updateVip', {
      url: '/update-vip',
      templateUrl: 'app/main/profile/update_vip.html',
      controller: 'UpdateVipCtrl',
      data: {
        pageTitle: 'Upgrade Plan',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
       packages: function(memberPackageService){
          return memberPackageService.findAll().then(function(data){
            return data.data;
          });
        }
      }
    });
    $stateProvider.state('paymentHistory', {
      url: '/payment-history',
      templateUrl: 'app/main/profile/payment_history.html',
      controller: 'PaymentHistoryCtrl',
      data: {
        pageTitle: 'Payment History',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
       orders: function(orderService,Auth){
         return orderService.findAll(16,0).then(function(data){
            return data.data;
          });
        },
        orderCount: function(orderService,Auth){

          return orderService.findAll().then(function(data){
            return data.data;
          });

        }
      }
    });

    $stateProvider.state('subscriptionsManagement', {
      url: '/subscriptions-management',
      templateUrl: 'app/main/profile/subscriptions_management.html',
      controller: 'SubscriptionsManagementCtrl',
      data: {
        pageTitle: 'Subscriptions Management',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
        /*
       orders: function(userService,Auth){
         return orderService.findAll(16,0).then(function(data){
            return data.data;
          });
        },
        orderCount: function(orderService,Auth){

          return orderService.findAll().then(function(data){
            return data.data;
          });

        }
        */
      }
    });

    $stateProvider.state('pageView', {
      url: '/pages/:alias',
      templateUrl: 'app/main/page/view.html',
      controller: 'PageViewCtrl',
      resolve: {
        page: function(pageService, $stateParams){
          return pageService.find($stateParams.alias).then(function(data){
            return data.data;
          });
        }
      }
    });


    $stateProvider.state('escorts', {
      url: '/escorts',
      templateUrl: 'app/main/models/index.html',
      controller: 'ModelsCtrl',
      data: {
        pageTitle: 'Models',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
        models: function(perfomerService){
          return perfomerService.findAll({
            limit: 12,
            offset: 0,
            sortField: 'sort',
            orderType: 1
          }).then(function(data){
            return data.data;
          });
        },
        modelsCount: function(perfomerService){
          return perfomerService.findAll({
            limit: 'undefined',
            offset: 'undefined'
          }).then(function(data){
            return data.data;
          });
        }
      }
    });


    $stateProvider.state('buySuccess', {
      url: '/buy-success',
      templateUrl: 'app/main/store/buy_success.html',
      controller: 'BuySuccessCtrl',
      resolve: {

      }
    });


    $stateProvider.state('aboutUs', {
      url: '/about-us',
      templateUrl: 'app/main/pages/about-us.html',
      controller: 'NoActionPagesCtrl',
      resolve: {

      }
    });


    $stateProvider.state('help', {
      url: '/help',
      templateUrl: 'app/main/pages/help.html',
      controller: 'NoActionPagesCtrl',
      resolve: {
  
      }
    });

    $stateProvider.state('paymentThanks', {
      url: '/payment-thanks',
      templateUrl: 'app/payment/payment-thanks.html',
      controller: 'NoActionPagesCtrl',
      resolve: {
  
      }
    });

    $stateProvider.state('paymentCancel', {
      url: '/payment-cancel',
      templateUrl: 'app/payment/payment-cancel.html',
      controller: 'NoActionPagesCtrl',
      resolve: {
  
      }
    });
    $stateProvider.state('modelView', {
      url: '/:id',
      templateUrl: 'app/main/models/view.html',
      controller: 'ModelsViewCtrl',
      resolve: {
        perfomer: function(perfomerService, $stateParams){
          return perfomerService.find($stateParams.id).then(function(data){
            return data.data;
          });
        }
      }
    });
 
    });
