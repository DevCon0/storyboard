angular.module('storyBoard.singleStory', [])

.controller('singleStoryCtrl', function ($scope, StoryStorage, StoryStateMachine, $stateParams, localStorageService, PageInfo) {
  $scope.storyTitle = null;
  $scope.storyUsername = null;
  $scope.act1divclass = '';
  $scope.act2divclass = '';
  $scope.act3divclass = '';
  $scope.isFirstFrameLoaded = false;

  var storyID = $stateParams.storyId;
  var token = localStorageService.get('sessionToken');

  StoryStorage.getStory(storyID)
  .then(function (story) {
    var createdAtData = story.data.createdAt.substring(0,story.data.createdAt.indexOf('T')).split('-');
    var createdAtString = createdAtData[1] + '/' + createdAtData[2] + '/' + createdAtData[0];
    $scope.storyTitle = story.data.title;
    $scope.viewCount = story.data.views;
    $scope.storyUsername = story.data.username;
    $scope.storyDescription = story.data.description;
    $scope.storyCreatedAt = createdAtString;
    var isSingleStoryView = true;
    PageInfo.set({'title': '"' + $scope.storyTitle + '"'});
    StoryStateMachine.setStory(story.data, isSingleStoryView, $scope);
  });

  $scope.replay = function () {
    StoryStateMachine.restartStory();
  };
});
