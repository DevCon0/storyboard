angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('signin')
  }

  $scope.username = localStorageService.get('username');

  $scope.editStory = function (storyId) {
    console.log('editStory function (controller) run with', storyId);

  }

  $scope.deleteStory = function (storyId) {
    console.log('deleteStory function (controller) run with', storyId);
    StoryStorage.deleteStory(storyId)
    .then(function (resp) {
      console.log('resp from deleteStory', resp);
    })
  }

  StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
  .then(function(library){
    $scope.userLibrary = library;
  });

});
