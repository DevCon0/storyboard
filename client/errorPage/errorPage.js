angular.module('storyBoard.errorPage', [])

.controller('errorPageCtrl', function ($scope, localStorageService) {
  $scope.username = localStorageService.get('username');

})
