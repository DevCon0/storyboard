angular.module('storyBoard.navBar', [])

.controller('navBarCtrl', function ($scope, Auth, localStorageService) {

  $scope.currentLocation = ""

  if (Auth.isAuth()) {
    $scope.currentUserLoggedIn = true;
  }

  $scope.logout = function () {
    var token = localStorageService.get('sessiontoken');
    $scope.currentUserLoggedIn = false;
    Auth.logout(token);
  }

})
