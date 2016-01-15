angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function($scope, StoryStorage, StoryStateMachine, $sce){
  var dummyId = 1;
  var story = StoryStorage.getStory(dummyId);
  StoryStateMachine.setStory(story);
});

