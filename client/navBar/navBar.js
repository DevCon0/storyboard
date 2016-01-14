angular.module('storyBoard.navBar', [])

.controller('navBarCtrl', function ($scope, $window, localStorageService,Auth){
  
  if (Auth.isAuth()) {
    $scope.currentUserSignedIn = true;
  }

})