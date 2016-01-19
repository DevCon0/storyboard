angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams) {
  var storyID = $stateParams.storyId;
  console.log('storyID', storyID);
  StoryStorage.getStory(storyID)
  .then(function (story) {
    console.log('what do I have', story.data);
    StoryStateMachine.setStory(story.data);
  });
});
