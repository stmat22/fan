"use strict";
angular.module('xMember')
  .factory('mediaService', function ($http) {
    return {
        getSuscribedPerformersFeed: function(limit,offsetPhotos, offsetVideos){
            return $http.get('/api/v1/media/search?getSuscribedPerformersFeed=1&limit='+limit+'&offsetPhotos='+offsetPhotos+'&offset='+offsetVideos);
        },
        getPerformerFeed: function(performerId, limit,offsetPhotos, offsetVideos){
            return $http.get('/api/v1/media/search?getPerformerFeed=1&performerId='+performerId+'&limit='+limit+'&offsetPhotos='+offsetPhotos+'&offset='+offsetVideos);
        },
        search: function(params) {
        return $http.get('/api/v1/media/search', { params: params }).then(function(resp) { return resp.data; });
        }
    };
  });
