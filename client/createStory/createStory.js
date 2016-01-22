angular.module('storyBoard.createStory', [])

.controller('createStoryCtrl', function ($scope, $state, StoryStorage, StoryStateMachine, localStorageService, $window, Auth, $stateParams) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('login')
  }

  $scope.showSpinner1 = false;
  $scope.addFrame1ImagePreview = false;

  $scope.showSpinner2 = false;
  $scope.addFrame2ImagePreview = false;

  $scope.showSpinner3 = false;
  $scope.addFrame3ImagePreview = false;

  $scope.user = localStorageService.get('username');
  var token = localStorageService.get('sessiontoken');
  var wasPassed = Object.keys($stateParams.story).length !== 0;

  if (wasPassed) {
    var editStory = $stateParams.story;
    $scope.storyTitle = editStory.title;
    $scope.storyDescription = editStory.description;
    $scope.storyThumbnailUrl = editStory.thumbnail;

    $scope.frame1MediaType = null; //TODO: fill in
    $scope.frame1YoutubeUrl = recreateVideoUrl(editStory.frames[0].videoId);
    $scope.frame1StartTime = editStory.frames[0].start;
    $scope.frame1EndTime = editStory.frames[0].end;
    $scope.frame1ImageUrl = null; //TODO: fill in
    $scope.frame1UrlDuration = null; //TODO: fill in

    $scope.frame2MediaType = null; //TODO: fill in
    $scope.frame2YoutubeUrl = recreateVideoUrl(editStory.frames[1].videoId);
    $scope.frame2StartTime = editStory.frames[1].start;
    $scope.frame2EndTime = editStory.frames[1].end;
    $scope.frame2ImageUrl = null; //TODO: fill in
    $scope.frame2UrlDuration = null; //TODO: fill in

    $scope.frame3MediaType = null; //TODO: fill in
    $scope.frame3YoutubeUrl = recreateVideoUrl(editStory.frames[2].videoId);
    $scope.frame3StartTime = editStory.frames[2].start;
    $scope.frame3EndTime = editStory.frames[2].end;
    $scope.frame3ImageUrl = null; //TODO: fill in
    $scope.frame3UrlDuration = null; //TODO: fill in
  } else {
    $scope.storyTitle = null;
    $scope.storyDescription = null;
    $scope.storyThumbnailUrl = null;

    $scope.frame1MediaType = null;
    $scope.frame1YoutubeUrl = null;
    $scope.frame1StartTime = null;
    $scope.frame1EndTime = null;
    $scope.frame1ImageUrl = null;
    $scope.frame1UrlDuration = null;

    $scope.frame2MediaType = null;
    $scope.frame2YoutubeUrl = null;
    $scope.frame2StartTime = null;
    $scope.frame2EndTime = null;
    $scope.frame2ImageUrl = null;
    $scope.frame2UrlDuration = null;

    $scope.frame3MediaType = null;
    $scope.frame3YoutubeUrl = null;
    $scope.frame3StartTime = null;
    $scope.frame3EndTime = null;
    $scope.frame3ImageUrl = null;
    $scope.frame3UrlDuration = null;
  }

  $scope.prepopulateInputs = function(){
    //TODO: remove once done with development
    $scope.storyTitle = "Testing Title";
    $scope.storyDescription = "Testing description";
    $scope.storyThumbnailUrl = "https://imgflip.com/s/meme/Futurama-Fry.jpg"

    $scope.frame1YoutubeUrl = "https://www.youtube.com/watch?v=yViIi3gie2c";
    $scope.frame1StartTime = "32";
    $scope.frame1EndTime = "37";
    $scope.frame1ImageUrl = "http://i.imgur.com/7j15tXU.jpg";
    $scope.frame1UrlDuration = 2;

    $scope.frame2YoutubeUrl = "https://www.youtube.com/watch?v=PLLQK9la6Go";
    $scope.frame2StartTime = "174";
    $scope.frame2EndTime = "179";
    $scope.frame2ImageUrl = "http://gifstumblr.com/images/bird-vs-action-figure_1509.gif";
    $scope.frame2UrlDuration = 3;


    $scope.frame3YoutubeUrl = "https://www.youtube.com/watch?v=COvnHv42T-A";
    $scope.frame3StartTime = "104";
    $scope.frame3EndTime = "106";
    $scope.frame3ImageUrl = "https://s-media-cache-ak0.pinimg.com/236x/9d/4c/ea/9d4cea965b2310610c99bc0eb72fe790.jpg";
    $scope.frame3UrlDuration = 1;
  }

  $scope.checkRequiredFields = function(){
    var allFieldsReady =
      $scope.storyTitle        &&
      $scope.storyDescription  &&
      $scope.storyThumbnailUrl &&
      $scope.frame1YoutubeUrl  &&
      $scope.frame1StartTime   &&
      $scope.frame1EndTime     &&
      $scope.frame2YoutubeUrl  &&
      $scope.frame2StartTime   &&
      $scope.frame2EndTime     &&
      $scope.frame3YoutubeUrl  &&
      $scope.frame3StartTime   &&
      $scope.frame3EndTime;
    return allFieldsReady;
  }

  $scope.saveStory = function(){
    var story = {
      title: $scope.storyTitle,
      description: $scope.storyDescription,
      thumbnail: $scope.storyThumbnailUrl,
      username: $scope.user,
      author: "hardcoded author name",
      FRAME1: 0,
      FRAME2: 1,
      FRAME3: 2,
      frames: [
        {
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: parseInt($scope.frame1StartTime),
          end: parseInt($scope.frame1EndTime)
        },
        {
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: parseInt($scope.frame2StartTime),
          end: parseInt($scope.frame2EndTime)
        },
        {
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: parseInt($scope.frame3StartTime),
          end: parseInt($scope.frame3EndTime)
        }
      ]
    }
    if (wasPassed) {
      StoryStorage.editStory(story, editStory.storyId, token)
        .then(function (data) {
          $state.go('dashboard');
      })
    } else {
      StoryStorage.saveStory(story, token)
        .then(function (data) {
          $state.go('dashboard');
        });
    }
  }

  $scope.previewStory = function () {
    var story = {
      FRAME1: 0,
      FRAME2: 1,
      FRAME3: 2,
      frames: [
        {
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: $scope.frame1StartTime,
          end: $scope.frame1EndTime
        },
        {
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: $scope.frame2StartTime,
          end: $scope.frame2EndTime
        },
        {
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: $scope.frame3StartTime,
          end: $scope.frame3EndTime
        }
      ]
    }
    StoryStateMachine.setStory(story);
  }

  $scope.destoryFrames = function(){
    StoryStateMachine.endStory();
  }

  var framePlayers = {
    frame1: null,
    frame2: null,
    frame3: null
  };

  $scope.previewFrame = function(frameId){
    var frameYoutubeUrl = null;
    var frameStartTime = null;
    var frameEndTime = null
    var frameDivId = null;
    var framePlayerName = null;
    switch(frameId){
      case 1:
        frameYoutubeUrl = $scope.frame1YoutubeUrl;
        frameStartTime = $scope.frame1StartTime;
        frameEndTime = $scope.frame1EndTime;
        frameDivId = 'frame1Preview';
        framePlayerName = 'frame1';
        $scope.showSpinner1 = true;
        break;
      case 2:
        frameYoutubeUrl = $scope.frame2YoutubeUrl;
        frameStartTime = $scope.frame2StartTime;
        frameEndTime = $scope.frame2EndTime;
        frameDivId = 'frame2Preview';
        framePlayerName = 'frame2';
        $scope.showSpinner2 = true;
        break;
      case 3:
        frameYoutubeUrl = $scope.frame3YoutubeUrl;
        frameStartTime = $scope.frame3StartTime;
        frameEndTime = $scope.frame3EndTime;
        frameDivId = 'frame3Preview';
        framePlayerName = 'frame3';
        $scope.showSpinner3 = true;
        break;
    }

    var videoId = stripOutVideoIdFromUrl(frameYoutubeUrl);

    createPreview(
      framePlayerName,
      frameDivId,
      videoId,
      frameStartTime,
      frameEndTime);
  };

  var createPreview = function(framePlayerName, domDiv, videoId, start, end){
    while( ! window.youtubeApiLoadedAndReady){};

    if(framePlayers[framePlayerName]){
      framePlayers[framePlayerName].destroy();
    }
    var VIDEO_HEIGHT = 160;
    var VIDEO_WIDTH = 284;
    framePlayers[framePlayerName] = new YT.Player(
      domDiv,
      {
        height: VIDEO_HEIGHT,
        width: VIDEO_WIDTH,
        videoId: videoId,
        playerVars: {
          controls: 0,
          showinfo: 0,
          start: start,
          end: end
        },
        events: {
          'onReady': function(){
            switch(framePlayerName){
              case 'frame1':
                $scope.$apply(function () {
                        $scope.showSpinner1 = false;
                });
              break;
              case 'frame2':
                $scope.$apply(function () {
                        $scope.showSpinner2 = false;
                });
              break;
              case 'frame3':
                $scope.$apply(function () {
                        $scope.showSpinner3 = false;
                });
              break;
            }
          },
          'onStateChange': function(event){
            //TODO: move into shared Youtube functionality service
            switch(event.data){
              case YT.PlayerState.PAUSED:
                var currentVideoInfo = event.target.h.h;
                var currentVideoId = currentVideoInfo.videoId;
                var currentVideoStart = currentVideoInfo.playerVars.start;
                var currentVideoEnd = currentVideoInfo.playerVars.end;
                event.target.cueVideoById(
                  {
                    'videoId': currentVideoId,
                    'startSeconds': currentVideoStart,
                    'endSeconds': currentVideoEnd
                  }
                );
                break;
            } //switch
          } //function
        } //events
      } //player config
    ); //new player
  }

  var stripOutVideoIdFromUrl = function(url){
    var videoId = url.split('v=')[1];
    var ampersandIndex = videoId.indexOf('&');
    if(ampersandIndex !== -1){
      videoId = videoId.substring(0, ampersandIndex);
    }

    return videoId;
  }


  function recreateVideoUrl(youtubeID) {
    var header = "https://www.youtube.com/watch?v=";
    return header + youtubeID;
  }

  $scope.previewImageFrame = function(frameId){
    switch(frameId){
      case 1:
        $scope.addFrame1ImagePreview = true;
        break;
      case 2:
        $scope.addFrame2ImagePreview = true;
        break;
      case 3:
        $scope.addFrame3ImagePreview = true;
        break;
    }
  }

});

