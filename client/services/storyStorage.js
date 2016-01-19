angular.module('storyBoard.storyStorageService', [])

.factory('StoryStorage', function ($http, $rootScope, $location, $window) {
  var storyStorage = {};

  storyStorage.getShowcase = function () {
    return $http ({
      method: 'GET',
      url: 'api/stories/showcase'
    })
  }


  storyStorage.getUserLibrary = function (token) {
    console.log('Getuser Library run with username', token);
    return $http({
      method: 'GET',
      url: '/api/stories/library/',
      headers: {
        'token': token
      }      
    })
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

  return storyStorage;
})
