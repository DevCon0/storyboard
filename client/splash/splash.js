angular.module('storyBoard.splash', ['ngAnimate'])

.controller('splashCtrl', function ($rootScope, $scope, $state, $window, StoryStorage) {
  StoryStorage.getShowcase()
  .then(function(resp){
    $scope.showcase = resp;
  });
  console.log($scope.showcase);

})
