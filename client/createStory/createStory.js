angular.module('storyBoard.createStory', [])

.controller('createStoryCtrl', function ($scope, localStorageService) {
  $scope.user = localStorageService.get('username');

})