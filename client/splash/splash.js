angular.module('storyBoard.splash', ['ngAnimate'])

.controller('splashCtrl', function ($rootScope, $scope, $state, $window, StoryStorage) {
  StoryStorage.getShowcase()
  .then(function(resp){
    $scope.showcase = resp;
    $scope.showcase.forEach(function(story) {
      story.frames.forEach(function(act) {
        act.isTextToSpeech = false;

        var previewUrlSrc = act.previewUrl.substring(0, 12)
        var previewUrlExt = act.previewUrl.substring(act.previewUrl.length -4)

        if (previewUrlSrc === '/api/images/' && previewUrlExt === ".svg") {
          act.isTextToSpeech = true;
        }
      })
    })
  console.log('$scope.showcase', $scope.showcase);
  });

})
