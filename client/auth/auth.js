angular.module('storyBoard.auth', [])

.controller('authCtrl', function ($rootScope, $scope, $state, localStorageService, $window, Auth, $location) {
  $scope.user = {};

  $scope.signup = function () {
    console.log('Sign Up requested for', $scope.user);
    Auth.signup($scope.user)
      .then(function () {
        localStorageService.set('user', $scope.user);
        sessionStorage.setItem('username', $scope.user.username);
        $location.path('/');
      })
    .catch(function (error) {
      $scope.err = error.data.message;
      $scope.showErr = true;
      console.log(error);
    });


  };

  $scope.signin = function () {
    console.log('user: ', $scope.user);
    Auth.signin($scope.user)
      .then(function () {
        localStorageService.set('user', $scope.user);
        if (Auth.isAuth()) {
          sessionStorage.setItem('username', $scope.user.username);
          $location.path('/');
        }
      })
      .catch(function (error) {
        $scope.err = error.data.message;
        $scope.showErr = true;
        console.log(error.data.message);
      });
  };

  $window.localStorage.removeItem('sessiontoken');
  localStorage.clear();
  localStorageService.clearAll();

})