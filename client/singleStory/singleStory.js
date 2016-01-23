angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams, localStorageService) {
  $scope.storyTitle = null;
  $scope.storyUsername = null;
  $scope.act1divclass = '';
  $scope.act2divclass = '';
  $scope.act3divclass = '';

  var storyID = $stateParams.storyId;
  var token = localStorageService.get('sessionToken');

  StoryStorage.getStory(storyID)
  .then(function (story) {
    $scope.storyTitle = story.data.title;
    $scope.storyUsername = story.data.username;
    var isSingleStoryView = true;
    StoryStateMachine.setStory(story.data, isSingleStoryView, $scope);
  });

  $scope.voteUp = function () {
    console.log('Vote Up recieved');
    StoryStorage.voteStory(storyID, token, 'up');

  }

  $scope.voteDown = function () {
    console.log('Vote Down recieved');
    StoryStorage.voteStory(storyID, token, 'down');

  }
});
