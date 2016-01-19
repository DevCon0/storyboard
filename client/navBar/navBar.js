angular.module('storyBoard.navBar', [])

.controller('navBarCtrl', function ($scope, Auth, localStorageService) {
  console.log($scope);

  if (Auth.isAuth()) {
    $scope.currentUserSignedIn = true;
  }

  $scope.signout = function () {
    var token = localStorageService.get('sessiontoken');
    $scope.currentUserSignedIn = false;
    Auth.signout(token);
  }

})