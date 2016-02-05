angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth, $stateParams) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('login');
  }

  $scope.username = localStorageService.get('username');

  $scope.editStory = function (storyId) {
    StoryStorage.getStory(storyId)
    .then(function (resp) {
      $state.go('createStory', { story: resp.data });
    })
    .catch(function (error) {
      $state.go('errorPage');
    });

  };

  $scope.deleteStory = function (storyId) {
    StoryStorage.deleteStory(storyId, localStorageService.get('sessiontoken'))
    .then(function (resp) {
    })
    .catch(function (error) {
      $state.go('errorPage');
    })
    .then(function () {
      StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
      .then(function (library) {
        $scope.userLibrary = library;
      });
    });

  };

  StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
  .then(function(library){
    $scope.userLibrary = library;
  });

});
