angular.module('storyBoard.auth', [])

.controller('authCtrl', function ($rootScope, $scope, $state, localStorageService, $window, Auth, $location) {
  $scope.user = {};

  $scope.signup = function () {
    console.log('Sign Up requested for', $scope.user);
    Auth.signup($scope.user)
      .then(function () {
        localStorageService.set('user', $scope.user);
        localStorageService.set('username', $scope.user.username);
        $location.path('/');
      })
    .catch(function (error) {
      $scope.err = error.statusText;
      $scope.showErr = true;
      console.log('incoming error', error);
    });


  };

  $scope.signin = function () {
    console.log('user: ', $scope.user);
    Auth.signin($scope.user)
      .then(function () {
        localStorageService.set('user', $scope.user);
      })
      .catch(function (error) {
        $scope.err = error.statusText;
        $scope.showErr = true;
        console.log('incoming error',error);
      });
  };

  localStorageService.clearAll();

})