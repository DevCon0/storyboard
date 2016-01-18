angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function($scope, StoryStorage, StoryStateMachine){
  var dummyId = '569ad180a1c16b7d4d1d8cde';
  StoryStorage.getStory(dummyId)
  .then(function (story) {
    console.log('what do I have', story.data);
    StoryStateMachine.setStory(story.data);
  });
});
