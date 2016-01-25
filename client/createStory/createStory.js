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

    // TODO: remove backwards compatibility
    if(editStory.frames[0].mediaType !== undefined) {
      $scope.frame1MediaType = editStory.frames[0].mediaType;
    } else {
      $scope.frame1MediaType = null;
    }
    $scope.frame1YoutubeUrl = recreateVideoUrl(editStory.frames[0].videoId);
    $scope.frame1StartTime = editStory.frames[0].start;
    $scope.frame1EndTime = editStory.frames[0].end;
    $scope.frame1ImageUrl = editStory.frames[0].imageUrl;
    $scope.frame1UrlDuration = editStory.frames[0].imageDuration;

    // TODO: remove backwards compatibility
    if(editStory.frames[1].mediaType !== undefined) {
      $scope.frame2MediaType = editStory.frames[1].mediaType;
    } else {
      $scope.frame2MediaType = null;
    }
    $scope.frame2YoutubeUrl = recreateVideoUrl(editStory.frames[1].videoId);
    $scope.frame2StartTime = editStory.frames[1].start;
    $scope.frame2EndTime = editStory.frames[1].end;
    $scope.frame2ImageUrl = editStory.frames[1].imageUrl;
    $scope.frame2UrlDuration = editStory.frames[1].imageDuration;

    // TODO: remove backwards compatibility
    if(editStory.frames[2].mediaType !== undefined) {
      $scope.frame3MediaType = editStory.frames[2].mediaType;
    } else {
      $scope.frame3MediaType = null;
    }
    $scope.frame3YoutubeUrl = recreateVideoUrl(editStory.frames[2].videoId);
    $scope.frame3StartTime = editStory.frames[2].start;
    $scope.frame3EndTime = editStory.frames[2].end;
    $scope.frame3ImageUrl = editStory.frames[2].imageUrl;
    $scope.frame3UrlDuration = editStory.frames[2].imageDuration;
  } else {
    $scope.storyTitle = null;
    $scope.storyDescription = null;
    $scope.storyThumbnailUrl = null;

    $scope.frame1MediaType = null;
    $scope.frame1YoutubeUrl = null;
    $scope.frame1StartTime = "0";
    $scope.frame1EndTime = null;
    $scope.frame1ImageUrl = null;
    $scope.frame1UrlDuration = null;

    $scope.frame2MediaType = null;
    $scope.frame2YoutubeUrl = null;
    $scope.frame2StartTime = "0";
    $scope.frame2EndTime = null;
    $scope.frame2ImageUrl = null;
    $scope.frame2UrlDuration = null;

    $scope.frame3MediaType = null;
    $scope.frame3YoutubeUrl = null;
    $scope.frame3StartTime = "0";
    $scope.frame3EndTime = null;
    $scope.frame3ImageUrl = null;
    $scope.frame3UrlDuration = null;
  }

  $scope.prepopulateInputs = function(){
    //TODO: remove once done with development
    $scope.storyTitle = "Danger Zone";
    $scope.storyDescription = "You're in the ....";
    $scope.storyThumbnailUrl = "http://www.foodsafetymagazine.com/fsm/cache/file/3B40D087-FDF9-43B7-9353CE2E6C9CC945.jpg"

    $scope.frame1YoutubeUrl = "https://www.youtube.com/watch?v=siwpn14IE7E";
    $scope.frame1StartTime = "29";
    $scope.frame1EndTime = "33";
    $scope.frame1ImageUrl = "http://i.imgur.com/7j15tXU.jpg";
    $scope.frame1UrlDuration = 2;

    $scope.frame2YoutubeUrl = "https://www.youtube.com/watch?v=8vuZ8jSVNUI";
    $scope.frame2StartTime = "21";
    $scope.frame2EndTime = "26";
    $scope.frame2ImageUrl = "http://gifstumblr.com/images/bird-vs-action-figure_1509.gif";
    $scope.frame2UrlDuration = 3;


    $scope.frame3YoutubeUrl = "https://www.youtube.com/watch?v=8vuZ8jSVNUI";
    $scope.frame3StartTime = "35";
    $scope.frame3EndTime = "45";
    $scope.frame3ImageUrl = "https://s-media-cache-ak0.pinimg.com/236x/9d/4c/ea/9d4cea965b2310610c99bc0eb72fe790.jpg";
    $scope.frame3UrlDuration = 1;
  }

  $scope.checkRequiredFields = function(){
    var storyMetaInfoReady =
      $scope.storyTitle        &&
      $scope.storyDescription  &&
      $scope.storyThumbnailUrl;

    var video1InfoReady =
      $scope.frame1YoutubeUrl &&
      $scope.frame1EndTime;

    var image1InfoReady =
      $scope.frame1ImageUrl &&
      $scope.frame1UrlDuration;

    var frame1Ready =
      video1InfoReady ||
      image1InfoReady;

    var video2InfoReady =
      $scope.frame2YoutubeUrl &&
      $scope.frame2EndTime;

    var image2InfoReady =
      $scope.frame2ImageUrl &&
      $scope.frame2UrlDuration;

    var frame2Ready =
      video2InfoReady ||
      image2InfoReady;

    var video3InfoReady =
      $scope.frame3YoutubeUrl &&
      $scope.frame3EndTime;

    var image3InfoReady =
      $scope.frame3ImageUrl &&
      $scope.frame3UrlDuration;

    var frame3Ready =
      video3InfoReady ||
      image3InfoReady;

    var allFieldsReady =
      storyMetaInfoReady &&
      frame1Ready        &&
      frame2Ready        &&
      frame3Ready;

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
          mediaType: $scope.frame1MediaType,
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: $scope.frame1StartTime ? parseInt($scope.frame1StartTime) : 0,
          end: $scope.frame1EndTime ? parseInt($scope.frame1EndTime) : 0,
          imageUrl: $scope.frame1ImageUrl,
          imageDuration: $scope.frame1UrlDuration ? parseInt($scope.frame1UrlDuration) : 0
        },
        {
          mediaType: $scope.frame2MediaType,
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: $scope.frame2StartTime ? parseInt($scope.frame2StartTime) : 0,
          end: $scope.frame2EndTime ? parseInt($scope.frame2EndTime) : 0,
          imageUrl: $scope.frame2ImageUrl,
          imageDuration: $scope.frame2UrlDuration ? parseInt($scope.frame2UrlDuration) : 0
        },
        {
          mediaType: $scope.frame3MediaType,
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: $scope.frame3StartTime ? parseInt($scope.frame3StartTime) : 0,
          end: $scope.frame3EndTime ? parseInt($scope.frame3EndTime) : 0,
          imageUrl: $scope.frame3ImageUrl,
          imageDuration: $scope.frame3UrlDuration ? parseInt($scope.frame3UrlDuration) : 0
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
          mediaType: $scope.frame1MediaType,
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: $scope.frame1StartTime,
          end: $scope.frame1EndTime,
          imageUrl: $scope.frame1ImageUrl,
          imageDuration: $scope.frame1UrlDuration
        },
        {
          mediaType: $scope.frame2MediaType,
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: $scope.frame2StartTime,
          end: $scope.frame2EndTime,
          imageUrl: $scope.frame2ImageUrl,
          imageDuration: $scope.frame2UrlDuration
        },
        {
          mediaType: $scope.frame3MediaType,
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: $scope.frame3StartTime,
          end: $scope.frame3EndTime,
          imageUrl: $scope.frame3ImageUrl,
          imageDuration: $scope.frame3UrlDuration
        }
      ]
    }
    var isSingleStoryView = false;
    var scope = null;
    StoryStateMachine.setStory(story, isSingleStoryView, scope);
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
                event.target.cueVideoById(
                  {
                    'videoId': videoId,
                    'startSeconds': start,
                    'endSeconds': end
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
    if( ! url) return url;

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

