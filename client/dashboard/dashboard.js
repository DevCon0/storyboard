angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('signin')
  }

  $scope.username = localStorageService.get('username');

  StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
  .then(function(library){
    $scope.userLibrary = library;
  });

});
