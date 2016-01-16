angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function($scope, StoryStorage, StoryStateMachine){
  var dummyId = 1;
  StoryStorage.getStory(dummyId)
  .then(function (story) {
    StoryStateMachine.setStory(story);
  });
});

