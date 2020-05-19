"use strict";
angular.module('xMember').controller('ModelsCtrl', function ($scope, $state, perfomerService, models, modelsCount) {
  $scope.models = models;
  $scope.maxSize = 10;
  $scope.totalItems = modelsCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;
  $scope.filter = {};
  $scope.isHided = false;

  $scope.updateFilter = function () {
    $scope.pageChanged(1);
    perfomerService.findAll({
      limit: 'undefined',
      offset: 'undefined',
      keyword: $scope.filter.keyword,
      size: $scope.filter.size,
      sex: $scope.filter.sex
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
      sortField: 'sort',
      orderType: 1,
      keyword: $scope.filter.keyword,
      size: $scope.filter.size,
      sex: $scope.filter.sex
    }).then(function (data) {
      $scope.models = data.data;
    });
  };

  // // find subsciptions counting
  // angular.forEach($scope.models, function(model) {
  //   perfomerService.subsciptionsCount(model._id).then(function(data){
  //     model.subsciptionsCount = data;
  //   })
  // });

});

angular.module('xMember').controller('ModelsViewCtrl', function ($scope, Lightbox, Auth, $state, $sce,
  perfomer, perfomerService, mediaService, growl, $cookies) {
  $scope.model = Auth.getCurrentUser();
  $scope.photoUploadform = true;
  $scope.imageUrl = '';

  $scope.ShowPhotoUpload = () => {
    $scope.photoUploadform = true;
  }
  $scope.HidePhotoUpload = () => {
    $scope.photoUploadform = false;
  }
  $scope.post = (data) => {
    console.log(data)
  }
  $scope.upload = function (data) {
    console.log("$scope.upload -> data", data)
    // if (data.files && data.files[0]) {
    //   var reader = new FileReader();
    //   reader.onload = function (e) {
    //     $scope.imageUrl = e.target.result
    //   }
    //   reader.readAsDataURL(data.files[0]);

    // }
  }
  mediaService.getPerformerFeed(perfomer._id, 10, 0, 0).then(function (result) {
    console.log(result);
    $scope.medias = result.data.map(function (a) {
      a.tags = a.tags.join(', ');
      return a;
    });
  });

  $(document).ready(function () {


  });
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };

  $scope.me = Auth.getCurrentUser();
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.perfomer = perfomer;
  perfomerService.checkBlock({
    objectId: $scope.me._id,
    userId: $scope.perfomer._id
  }).then(resp => $scope.blocked = resp.blocked);
  if ($scope.me.role === 'performer') {
    perfomerService.checkAllowViewProfile({
      objectId: Auth.getCurrentUser()._id,
      userId: perfomer._id
    }).then(res => {
      $scope.isAllowed = res.allowed;
    });
  }
  if (localStorage.getItem('isFirst' + perfomer._id) !== '1') {
    $scope.autoPlay = 'autoplay';
    localStorage.setItem('isFirst' + perfomer._id, '1');
  } else {
    $scope.autoPlay = null;
  }
  //check subscribe
  if ($scope.isLoggedIn()) {
    perfomerService.checkSubscribe($scope.perfomer._id).then(function (res) {
      $scope.checkSubscribe = res.subscribed;
      if ($scope.me._id === $scope.perfomer._id) {
        $scope.checkSubscribe = 1;
        $scope.isHided = true;
      } else if ($scope.checkSubscribe === 1) {
        $scope.checkSubscribe = 1;
        $scope.isHided = true;
      } else if (!$scope.me._id) {
        $scope.checkSubscribe = 0;
        $scope.isHided = false;
      }
    });
  }
  //change grid video to lines
  $scope.listStyle = 'grid';
  $scope.changeStyle = function (val) {
    $scope.listStyle = val;
  };
  $(window).resize(function () {
    var width = $(window).width();
    if (width < 768) {
      $scope.listStyle = 'line';
      $scope.$apply();
    } else {
      $scope.listStyle = 'grid';
      $scope.$apply();
    }
  });
  $scope.maxSize = 5;
  $scope.itemsPerPage = 12;
  $scope.maxSize = 5;
  $scope.totalItems = 0;
  $scope.totalItems1 = 0;
  $scope.totalItems3 = 0;
  $scope.totalItems4 = 0;
  $scope.currentPage = 1;
  $scope.currentPage1 = 1;
  $scope.canLoadMore = false;
  $scope.ispagnation = false;
  $scope.sort = 'newest';

  //search
  $scope.searchModel = function (evt) {
    if (!$scope.keyword) {
      return;
    }
    if (evt && evt.keyCode !== 13) {
      return;
    }
    $state.go('search', {
      q: $scope.keyword,
      r: Math.random(),
      p: perfomer._id
    });
  };

  $state.current['data'] = {
    pageTitle: $scope.perfomer.name,
    metaKeywords: $scope.perfomer.description,
    metaDescription: $scope.perfomer.description
  };
  perfomerService.addView($scope.perfomer._id);
  $scope.tab = 'Videos';
  $scope.$on('$locationChangeSuccess', function () {
    if (window.location && window.location.hash) {
      $scope.tab = window.location.hash.slice(1);
    }
  });
  $scope.changeTab = function (tab) {
    $scope.tab = tab;
  };








  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };


  $scope.me = Auth.getCurrentUser();
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.perfomer = perfomer;

  /*
  // load more video on scroll
  $(window).scroll(function () {
    if ($(window).scrollTop() > $(document).height() - $(window).height() - 30 && !$scope.loading && $scope.canLoadMore) {
      $scope.currentPage += 1;
      $scope.queryVideos();
    }
  });

  $scope.loadMore = function () {
    if ($scope.canLoadMore) {
      $scope.currentPage += 1;
      $scope.queryVideos();
    }
  };

  $scope.openLightboxModal2 = function () {
    if (Auth.isLoggedIn() && Auth.getCurrentUser().isVip) {
      Lightbox.openModal([$scope.perfomer], 0);
    }
  };
  $scope.openLightboxModal = function (index) {
    if (Auth.isLoggedIn() && Auth.getCurrentUser().isVip) {
      Lightbox.openModal($scope.photos, index);
    }
  };
  //search
  $scope.searchModel = function (evt) {
    if (!$scope.keyword) {
      return;
    }
    if (evt && evt.keyCode !== 13) {
      return;
    }
    $state.go('search', {
      q: $scope.keyword,
      r: Math.random(),
      p: perfomer._id
    });
  };
  */
  $state.current['data'] = {
    pageTitle: $scope.perfomer.name,
    metaKeywords: $scope.perfomer.description,
    metaDescription: $scope.perfomer.description
  };

  perfomerService.addView($scope.perfomer._id);

  $scope.tab = 'Videos';
  $scope.$on('$locationChangeSuccess', function () {
    if (window.location && window.location.hash) {
      $scope.tab = window.location.hash.slice(1);
    }
  });

  $scope.changeTab = function (tab) {
    $scope.tab = tab;
  };
});
