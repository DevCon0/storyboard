angular.module('storyBoard.navBar', ['storyBoard.pageInfo'])

.controller('navBarCtrl', function ($scope, Auth, localStorageService, PageInfo, $location) {

  $scope.currentLocation = "";

  if (Auth.isAuth()) {
    $scope.currentUserLoggedIn = true;
  }

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
      return 'Top Stories';
      break;
    case 'createStory':
      return 'Create Story';
      break;
    case 'library':
      return 'Library';
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
