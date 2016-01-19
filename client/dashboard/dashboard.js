angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, StoryStorage, localStorageService, Auth) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('signin')
  }

  $scope.username = localStorageService.get('username');

  $scope.userLibrary = StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'));

})