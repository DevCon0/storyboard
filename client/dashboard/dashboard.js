angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $window, StoryStorage, localStorageService, Auth, $location) {
  $scope.user = localStorageService.get('user');

  //$scope.userLibrary = StoryStorage.getUserLibrary($scope.user.id);

  





})