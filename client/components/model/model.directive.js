'use strict';
/*
angular.module('xMember')
  .directive('recentModel', function () {
    return {
      templateUrl: 'components/model/recent-model.html',
      restrict: 'E',
      replace: true,
      scope: {
        showHome: '='
      },
      controller: function ($scope, perfomerService, Auth) {
        $scope.model = Auth.getCurrentUser();
        if (!$scope.model) {
          $scope.model._id = '';
        }
        perfomerService.leaderboards({
          take: 10,
          page: 1,
          showHome: $scope.showHome || ''
        }).then(function (result) {
          $scope.performers = result.items.filter(i => i._id !== $scope.model._id);
        });
      }
    };
  });
*/
  angular.module('xMember')
  .directive('modelFeed', function (Auth) {
    let user = Auth.getCurrentUser();
    return {
      templateUrl: 'components/model/model-feed.html',
      restrict: 'E',
      replace: false,
      scope: {
        showHome: '='
      },
      controller: function ($scope, mediaService, Auth) {
        
        $scope.model = Auth.getCurrentUser();
        if (!$scope.model) {
          $scope.model._id = '';
        }
        // getSuscribedPerformersFeed: function(limit,offsetPhotos, offsetVideos){
        mediaService.getSuscribedPerformersFeed(10, 0, 0).then(function (result) {
          $scope.medias = result.data.map(function(a){
            a.tags = a.tags.join(', ');
            a.performerIcon = a.performer[0].imageThumbPath;
            a.performerUsername = a.performer[0].username;
            return a;
          });
        });
      }
    };
  });

  angular.module('xMember')
  .directive('homeModels', function () {
    return {
      templateUrl: 'components/model/home-models.html',
      restrict: 'E',
      replace: true,
      scope: {
        showHome: '='
      },
      controller: function ($scope, perfomerService, Auth) {
        $scope.maxSize = 10;
        $scope.totalItems = null;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 12;
        $scope.filter = {};
        $scope.isHided = false;
        $scope.sex = '';

        perfomerService.findAll({
          limit: $scope.itemsPerPage,
          sortField: 'createdAt',
          orderType: -1,
          sex: ''
        }).then(function (data) {
          $scope.models = data.data;
        });

        $scope.updateFilter = function (sex, $event) {
          let btn = $event.currentTarget;
          $(btn.parentElement).find('button').removeClass('selected');
          $(btn).find('button').addClass('selected');
          $scope.sex = sex || null;
          $scope.pageChanged(1);
          perfomerService.findAll({
            sortField: 'createdAt',
            orderType: -1,
            limit: $scope.itemsPerPage,
            offset: 0,
            /*keyword: $scope.filter.keyword,
            size: $scope.filter.size,*/
            sex: $scope.sex
          }).then(function (data) {
            $scope.models = data.data;
            $scope.totalItems = data.data;
          });
        };
        $scope.filter = function (sort) {
          $scope.pageChanged();
          perfomerService.search({
            take: 12,
            sort: sort
          }).then(function (data) {
            $scope.models = data.items;
            $scope.totalItems = data.count;
          });
        };
        $scope.pageChanged = function (currentPage) {
          perfomerService.findAll({
            limit: $scope.itemsPerPage,
            offset: currentPage - 1,
            sortField: 'updatedAt',
            orderType: -1,
            keyword: $scope.filter.keyword,
            size: $scope.filter.size,
            sex: $scope.sex
          }).then(function (data) {
            $scope.models = data.data;
          });
        };

      }
    };
  });

  angular.module('xMember')
  .directive('recentModel', function () {
    return {
      templateUrl: 'components/model/home-models.html',
      restrict: 'E',
      replace: true,
      scope: {
        showHome: '='
      },
      controller: function ($scope, perfomerService, Auth) {
        $scope.maxSize = 10;
        $scope.totalItems = null;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 12;
        $scope.filter = {};
        $scope.isHided = false;
        $scope.sex = '';

        perfomerService.findAll({
          limit: $scope.itemsPerPage,
          sortField: 'createdAt',
          orderType: -1,
        }).then(function (data) {
          $scope.models = data.data;
        });

        $scope.updateFilter = function (sex, $event) {
          let btn = $event.currentTarget;
          $(btn.parentElement).find('button').removeClass('selected');
          $(btn).find('button').addClass('selected');
          $scope.sex = sex;
          $scope.pageChanged(1);
          perfomerService.findAll({
            limit: 'undefined',
            offset: 'undefined',
            keyword: $scope.filter.keyword,
            size: $scope.filter.size,
            sex: $scope.sex
          }).then(function (data) {
            $scope.totalItems = data.data;
          });
        };
        $scope.filter = function (sort) {
          $scope.pageChanged();
          perfomerService.search({
            take: 12,
            sort: sort
          }).then(function (data) {
            $scope.models = data.items;
            $scope.totalItems = data.count;
          });
        };
        $scope.pageChanged = function (currentPage) {
          perfomerService.findAll({
            limit: $scope.itemsPerPage,
            offset: currentPage - 1,
            sortField: 'updatedAt',
            orderType: -1,
            keyword: $scope.filter.keyword,
            size: $scope.filter.size,
            sex: $scope.sex
          }).then(function (data) {
            $scope.models = data.data;
          });
        };

      }
    };
  });
