angular.module('storyBoard.splash', ['ngAnimate'])

.controller('splashCtrl', function ($rootScope, $scope, $state, StoryStorage, $stateParams, PageInfo) {

  // Set a bool to indicate whether this is the signed-in user's library
  //   or another user's library.
  $scope.isProfilePage = (!!$stateParams.username);

  $scope.username = $stateParams.username || '';

  $scope.getShowcase = function () {
    StoryStorage.getShowcase()
    .then(function (resp) {
      $scope.showcase = resp;
      $scope.showcase.forEach(function (story) {
        story.frames.forEach(function (act) {
          act.isTextToSpeech = false;

          var previewUrlSrc = act.previewUrl.substring(0, 12);
          var previewUrlExt = act.previewUrl.substring(act.previewUrl.length - 4);

          if (previewUrlSrc === '/api/images/' && previewUrlExt === ".svg") {
            act.isTextToSpeech = true;
          }
        });
      });
    });
  };

  $scope.getUserProfile = function () {
    StoryStorage.getUserProfile($scope.username)
    .then(function (library) {
      $scope.showcase = library;
    });
  };

  if ($scope.isProfilePage) {
    PageInfo.set({ 'title': $scope.username });
    $scope.getUserProfile();
  } else {
    $scope.getShowcase();
  }

});
