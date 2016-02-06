angular.module('storyBoard.navBar', ['storyBoard.pageInfo'])

.controller('navBarCtrl', function ($scope, Auth, localStorageService, PageInfo, $location) {

  $scope.currentLocation = "";

  if (Auth.isAuth()) {
    $scope.currentUserLoggedIn = true;
  }

  const TOP_STORIES_LINK = 'Top Stories';
  const CREATE_STORY_LINK = 'Create Story';
  const LIBRARY_LINK = 'Library';

  $scope.logout = function () {
    var token = localStorageService.get('sessiontoken');
    $scope.currentUserLoggedIn = false;
    Auth.logout(token)
    .catch(function (error) {
      console.log('incoming error', error);
    });
  };

  $scope.setPageTitle = function() {
    var state = $location.url()
    var endpoint = state.split('/')[1]
    switch (endpoint) {
    case '':
      return TOP_STORIES_LINK;
      break;
    case 'createStory':
      return CREATE_STORY_LINK;
      break;
    case 'library':
      return LIBRARY_LINK;
      break;
    default:
      return PageInfo.get('title');
    }
  };

  $scope.isCreateStoryPage = function() {
    return ($scope.pageTitle == CREATE_STORY_LINK);
  };

  $scope.isLibraryPage = function() {
    return ($scope.pageTitle == LIBRARY_LINK);
  };

  $scope.$watch($scope.setPageTitle, function(newTitle) {
    if (newTitle !== $scope.pageTitle) {
      $scope.pageTitle = newTitle;
    }
  })
});
