angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams) {
  $scope.storyTitle = null;
  $scope.storyUsername = null;
  var storyID = $stateParams.storyId;
  StoryStorage.getStory(storyID)
  .then(function (story) {
    $scope.storyTitle = story.data.title;
    $scope.storyUsername = story.data.username;
    StoryStateMachine.setStory(story.data);
  });
});
