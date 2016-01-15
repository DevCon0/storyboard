angular.module('storyBoard.authService', [])

.factory('Auth', function ($http, $location, $window, localStorageService, $state) {
  var auth = {};
  auth.signin = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function (resp) {
      console.log('ran sign in with resp: ', resp);
      localStorageService.setItem('sessiontoken', resp.data.token);
      localStorageService.setItem('username', resp.data.username);
      $location.path('/');
    });
  };

  auth.signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      localStorageService.setItem('sessiontoken', resp.data.token);
      $location.path('/')
    });
  };

  auth.isAuth = function () {
    return !!localStorageService.getItem('sessiontoken');
  };

  auth.signout = function () {
    localStorageService.removeItem('sessiontoken');
    $location.path('/');
  };

  return auth;
})