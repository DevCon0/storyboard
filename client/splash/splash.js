angular.module('storyBoard.splash', [])

.controller('splashCtrl', function ($rootScope, $scope, $state, $window, StoryStorage) {

  $scope.topStories = StoryStorage.getShowcase();

})