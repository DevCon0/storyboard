angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams) {
  var storyID = $stateParams.storyId;
  StoryStorage.getStory(storyID)
  .then(function (story) {
    StoryStateMachine.setStory(story.data);
  });
});
