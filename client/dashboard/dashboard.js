angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('signin')
  }

  $scope.username = localStorageService.get('username');

  $scope.editStory = function (storyId) {
    console.log('editStory function (controller) run with', storyId);
    localStorageService.remove('editStory');
    StoryStorage.getStory(storyId)
    .then(function (resp) {
      console.log('editStory contorller response.data', resp.data);
      localStorageService.set('editStory', resp.data);
    })
    .then(function () {
      $state.go('createStory');
    })

  }

  $scope.deleteStory = function (storyId) {
    console.log('deleteStory function (controller) run with', storyId);
    StoryStorage.deleteStory(storyId, localStorageService.get('sessiontoken'))
    .then(function (resp) {
      console.log('resp from deleteStory', resp);
    })
    .then(function () {
      StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
      .then(function (library) {
        $scope.userLibrary = library;
      });
    })
  }

  StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
  .then(function(library){
    $scope.userLibrary = library;
  });

});
