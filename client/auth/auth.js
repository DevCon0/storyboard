angular.module('storyBoard.auth', [])

.controller('authCtrl', function ($rootScope, $scope, $state, localStorageService, $window, Auth, $location) {
  $scope.user = {};

  $scope.signup = function () {
    console.log('Sign Up requested for', $scope.user);
    Auth.signup($scope.user)
      .then(function (resp) {
        console.log('Sign Up response', resp);
        localStorageService.set('sessiontoken', resp.data.token);
        localStorageService.set('username', resp.data.username);
        $location.path('/');
      })
    .catch(function (error) {
      $scope.err = error.statusText;
      $scope.showErr = true;
      console.log('incoming error', error);
    });


  };

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (resp) {
        localStorageService.set('username', resp.data.username);
        localStorageService.set('sessiontoken', resp.data.token);
        $location.path('/');
      })
      .catch(function (error) {
        $scope.err = 'Invalid Username/Password';
        $scope.showErr = true;
        console.log('incoming error',error);
      });
  };

  localStorageService.clearAll();

});
