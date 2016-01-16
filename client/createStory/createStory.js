angular.module('storyBoard.createStory', [])

.controller('createStoryCtrl', function ($scope, $state, localStorageService, $window) {
  $scope.user = localStorageService.get('username');

  $scope.frame1YoutubeUrl = null;
  $scope.frame1StartTime = null;
  $scope.frame1EndTime = null;

  $scope.frame2YoutubeUrl = null;
  $scope.frame2StartTime = null;
  $scope.frame2EndTime = null;

  $scope.frame3YoutubeUrl = null;
  $scope.frame3StartTime = null;
  $scope.frame3EndTime = null;

  $scope.checkRequiredFields = function(){
    var allFieldsReady =
      $scope.frame1YoutubeUrl &&
      $scope.frame1StartTime  &&
      $scope.frame1EndTime    &&
      $scope.frame2YoutubeUrl &&
      $scope.frame2StartTime  &&
      $scope.frame2EndTime    &&
      $scope.frame3YoutubeUrl &&
      $scope.frame3StartTime  &&
      $scope.frame3EndTime;
    return allFieldsReady;
  }

  $scope.saveStory = function(){
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
    alert("Milco, you need to connect this to the server");
    $state.go('dashboard');
  }

  var framePlayers = {
    frame1: null,
    frame2: null,
    frame3: null
  };

  $scope.createFrame = function(frameId){
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
        break;
      case 2:
        frameYoutubeUrl = $scope.frame2YoutubeUrl;
        frameStartTime = $scope.frame2StartTime;
        frameEndTime = $scope.frame2EndTime;
        frameDivId = 'frame2Preview';
        framePlayerName = 'frame2';
        break;
      case 3:
        frameYoutubeUrl = $scope.frame3YoutubeUrl;
        frameStartTime = $scope.frame3StartTime;
        frameEndTime = $scope.frame3EndTime;
        frameDivId = 'frame3Preview';
        framePlayerName = 'frame3';
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
});

