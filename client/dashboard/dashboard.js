angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, StoryStorage, localStorageService, Auth) {
  console.log('dashboard controller initilized');
  $scope.username = localStorageService.get('username');

  StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
  .then(function(library){
    $scope.userLibrary = library;
  });

});
