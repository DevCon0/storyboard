angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth, $stateParams) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('login')
  }

  $scope.username = localStorageService.get('username');

  $scope.editStory = function (storyId) {
    StoryStorage.getStory(storyId)
    .then(function (resp) {
      $state.go('createStory', { story: resp.data });
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
    $scope.userLibrary.forEach(function(story) {
      story.frames.forEach(function(act) {
        act.isTextToSpeech = false;

        var previewUrlSrc = act.previewUrl.substring(0, 12)
        var previewUrlExt = act.previewUrl.substring(act.previewUrl.length -4)

        if (previewUrlSrc === '/api/images/' && previewUrlExt === ".svg") {
          act.isTextToSpeech = true;
        }
      })
    })
  });

});
