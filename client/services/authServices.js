angular.module('storyBoard.authService', [])

.factory('Auth', function ($http, $location, $window, localStorageService) {
  var auth = {};
  auth.signin = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function (resp) {
      console.log('ran sign in with resp: ', resp);
      $window.localStorage.setItem('sessiontoken', resp.data.token);
      localStorageService.set(resp.data.username);
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
      console.log('resp', resp);
      console.log('resp.data.token: ', resp.data.token);
      $window.localStorage.setItem('sessiontoken', resp.data.token);
      $location.path('/')
    });
  };

  auth.isAuth = function () {
    return !!$window.localStorage.getItem('sessiontoken');
  };

  auth.signout = function () {
    $window.localStorage.removeItem('sessiontoken');
    localStorage.clear();
    localStorageService.clearAll();
    $location.path('/signin');
  };

  return auth;
})