angular.module('storyBoard.profile', [])

.controller('profileCtrl', function ($scope, StoryStorage, localStorageService,User) {
  $scope.username = localStorageService.get('username');
  User.viewProfile($scope.username);
});

