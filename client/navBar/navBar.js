angular.module('storyBoard.navBar', ['storyBoard.pageInfo'])

.controller('navBarCtrl', function ($scope, Auth, localStorageService, PageInfo, $location) {

  $scope.currentLocation = "";

  if (Auth.isAuth()) {
    $scope.currentUserLoggedIn = true;
  }

  const TOP_STORIES_LINK = $scope.TOP_STORIES_LINK = 'Top Stories';
  const CREATE_STORY_LINK = $scope.CREATE_STORY_LINK = 'Create Story';
  const LIBRARY_LINK = $scope.LIBRARY_LINK = 'Library';
  $scope.TOP_STORIES_LINK = TOP_STORIES_LINK;
  $scope.CREATE_STORY_LINK = CREATE_STORY_LINK;
  $scope.LIBRARY_LINK = LIBRARY_LINK;

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
  }

  $scope.$watch($scope.setPageTitle, function(newTitle) {
    if (newTitle !== $scope.pageTitle) {
      $scope.pageTitle = newTitle;
    }
  })
});
