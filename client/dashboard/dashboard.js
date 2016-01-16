angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, StoryStorage, localStorageService, Auth) {
  console.log('dashboard controller initilized');
  $scope.username = localStorageService.get('username');

  $scope.userLibrary = StoryStorage.getUserLibrary($scope.username);

})