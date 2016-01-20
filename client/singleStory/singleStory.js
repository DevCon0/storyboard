angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams) {
  $scope.storyTitle = null;
  $scope.storyAuthor = null;
  var storyID = $stateParams.storyId;
  StoryStorage.getStory(storyID)
  .then(function (story) {
    $scope.storyTitle = story.data.title;
    StoryStateMachine.setStory(story.data);
  });
});
