angular.module('storyBoard.navBar', ['storyBoard.pageInfo'])

.controller('navBarCtrl', function ($scope, Auth, localStorageService, PageInfo, $location) {

  $scope.currentLocation = "";

  if (Auth.isAuth()) {
    $scope.currentUserLoggedIn = true;
  }

  var TOP_STORIES_STR = 'Top Stories';
  var CREATE_STORY_STR = 'Create Story';
  var LIBRARY_STR = 'Library';

  $scope.logout = function () {
    var token = localStorageService.get('sessiontoken');
    $scope.currentUserLoggedIn = false;
    Auth.logout(token)
    .catch(function (error) {
      console.log('incoming error', error);
    });
  };

  $scope.setPageTitle = function() {
    var state = $location.url();
    var endpoint = state.split('/')[1];
    switch (endpoint) {
    case '':
      return TOP_STORIES_STR;
    case 'createStory':
      return CREATE_STORY_STR;
    case 'library':
      return LIBRARY_STR;
    default:
      return PageInfo.get('title');
    }
  };

  $scope.isCreateStoryPage = function() {
    return ($scope.pageTitle == CREATE_STORY_STR);
  };

  $scope.isLibraryPage = function() {
    return ($scope.pageTitle == LIBRARY_STR);
  };

  $scope.$watch($scope.setPageTitle, function(newTitle) {
    if (newTitle !== $scope.pageTitle) {
      $scope.pageTitle = newTitle;
    }
  });
});
