angular.module('storyBoard.dashboard', [])

.controller('dashboardCtrl', function ($scope, $state, StoryStorage, localStorageService, Auth, $stateParams) {

  // Set a bool to indicate whether this is the signed-in user's dashboard
  //   or another user's dashboard.
  $scope.isSignedInUser = ( ! $stateParams.username );

  if ( $scope.isSignedInUser && ! (Auth.isAuth()) ) {
    $state.go('login')
  }

  $scope.username = ($scope.isSignedInUser)
    ? localStorageService.get('username')
    : $stateParams.username;

  $scope.editStory = function (storyId) {
    StoryStorage.getStory(storyId)
    .then(function (resp) {
      $state.go('createStory', { story: resp.data });
    })

  }

  $scope.deleteStory = function (storyId) {
    console.log('deleteStory function (controller) run with', storyId);
    StoryStorage.deleteStory(storyId, localStorageService.get('sessiontoken'))
    .then(function (resp) {
      console.log('resp from deleteStory', resp);
    })
    .then(function () {
      StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
      .then(function (library) {
        $scope.userLibrary = library;
      });
    })
  }

  $scope.getUserProfile = function() {
    StoryStorage.getUserProfile($scope.username)
    .then(function(library){
      $scope.userLibrary = library;
    });
  }

  $scope.getUserLibrary = function() {
    StoryStorage.getUserLibrary(localStorageService.get('sessiontoken'))
    .then(function(library){
      $scope.userLibrary = library;
    });
  };

  if ($scope.isSignedInUser) {
    $scope.getUserProfile();
  } else {
    $scope.getUserLibrary();
  }

});
