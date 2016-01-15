angular.module('storyBoard.navBar', [])

.controller('navBarCtrl', function ($scope, Auth) {
  console.log($scope);

  if (Auth.isAuth()) {
    $scope.currentUserSignedIn = true;
  }

  $scope.signout = function () {
    $scope.currentUserSignedIn = false;
    Auth.signout();
  }

})