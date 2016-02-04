angular.module('storyBoard.storyStorageService', [])

.factory('StoryStorage', function ($http, $rootScope, $location, $window ,$state) {
  var storyStorage = {};

  storyStorage.getShowcase = function () {
    return $http({
      method: 'GET',
      url: 'api/stories/showcase'
    })
    .then(function (resp) {
      return resp.data;
    })
    .catch(function (error) {
      $state.go('errorPage');
    });
  };

  storyStorage.getUserLibrary = function (token) {
    return $http({
      method: 'GET',
      url: '/api/stories/library/',
      headers: {
        'token': token
      }
    })
    .then(function (resp) {
      return resp.data;
    })
    .catch(function (error) {
      $state.go('errorPage');
    });
  };

  storyStorage.getUserProfile = function (username) {
    return $http({
      method: 'GET',
      url: '/api/users/profile/' + username,
    })
    .then(function (resp) {
      return resp.data;
    })
    .catch(function (error) {
      $state.go('errorPage');
    });
  };

  storyStorage.saveStory = function (story, token) {
    return $http({
      method: 'POST',
      url: '/api/stories/story',
      headers: {
        'token': token
      },
      data: story
    })
    .then(function (resp) {
      return resp.body;
    })
    .catch(function (error) {
      $state.go('errorPage');
    });
  };

  storyStorage.getStory = function (id) {
      return $http({
        method: 'GET',
        url: '/api/stories/story/' + id,
        data: id
      })
      .catch(function (error) {
        $state.go('errorPage');
      })
  };

  storyStorage.editStory = function (story, storyId, token) {
    story['storyId'] = storyId;
    return $http({
      method: 'PUT',
      url: '/api/stories/story',
      headers: {
        'token': token
      },
      data: story
    })
  };

  storyStorage.deleteStory = function (id,token) {
    return $http({
      method: 'DELETE',
      url: '/api/stories/story/' + id,
      headers: {
        'token': token
      },
      data: id
    })
  };

  storyStorage.voteStory = function (id, token, vote) {
    return $http({
      method: 'POST',
      url: '/api/stories/votes',
      headers: {
        'token': token
    },
      data: {
        storyId: id,
        direction: vote
      }
    })
  };

  return storyStorage;
})
