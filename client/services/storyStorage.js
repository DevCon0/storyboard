angular.module('storyBoard.storyStorageService', [])

.factory('StoryStorage', function ($http, $rootScope, $location, $window) {
  var storyStorage = {};

  storyStorage.getShowcase = function () {
    return $http ({
      method: 'GET',
      url: 'api/stories/showcase'
    })
    .then(function (resp) {
      console.log('resp from getShowcase', resp.data);
      return resp.data;
    })
  }


  storyStorage.getUserLibrary = function (token) {
    console.log('Getuser Library run with token', token);
    return $http({
      method: 'GET',
      url: '/api/stories/library/',
      headers: {
        'token': token
      }      
    })
    .then(function (resp) {
      console.log('resp.data from getuserLibrary', resp.data);
      return resp.data;
    });
  };

  storyStorage.saveStory = function (story,token) {
    console.log('saveStory called with', story);
    return $http({
     method: 'POST',
     url: '/api/stories/story',
     headers: {
       'token': token
     },
     data: story
    })
    .then(function (resp) {
      console.log('ran saveStory, got response: ', resp);
      return resp.body;
    });
  }

  storyStorage.getStory = function (id) {
      console.log('getStory called with', id);
      return $http({
        method: 'GET',
        url: '/api/stories/story/' + id,
        data: id
      })
  };

  storyStorage.deleteStory = function (id,token) {
    console.log('deleteStory (Factory) called with', id);
    return $http({
      method: 'DELETE',
      url: '/api/stories/story/' + id,
      headers: {
        'token': token
      },
      data: id
    })
  };

  return storyStorage;
})
