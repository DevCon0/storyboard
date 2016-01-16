angular.module('storyBoard.userServices', [])

.factory('User', function ($http) {
  var user = {};

  user.viewProfile = function (username) {

    console.log('viewProfile called with username', username);
    return $http({
      method: 'GET',
      url: '/api/users/' + username,

    })
     .then(function (resp) {
       console.log('ran viewProfile, got response: ', resp);
     });


  };
     return user;
})