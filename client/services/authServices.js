angular.module('storyBoard.authService', [])

.factory('Auth', function ($http, $location, $window, localStorageService, $state) {
  var auth = {};
  auth.login = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    });
  };

  auth.signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    });
  };

  auth.isAuth = function () {
    return !!localStorageService.get('sessiontoken');
  };

  auth.logout = function (token) {
    localStorageService.clearAll();
    return $http({
      method: 'POST',
      url: '/api/users/signout/',
      headers: {
        'token': token
      }
    })
    .then(function () {
      $location.path('/');
    });
  };

  return auth;
});
