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
      localStorageService.set('sessiontoken', resp.data.Token);
      localStorageService.set('username', resp.data.Username);
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
      localStorageService.set('sessiontoken', resp.data.Token);
      localStorageService.set('username', resp.data.username);
      $location.path('/')
    });
  };

  auth.isAuth = function () {
    return !!localStorageService.get('sessiontoken');
  };

  auth.signout = function () {
    localStorageService.clearAll();
    $location.path('/');
  };

  return auth;
})