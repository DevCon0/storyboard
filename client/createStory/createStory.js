angular.module('storyBoard.createStory', [])

.controller('createStoryCtrl', function ($scope,
                                         $state,
                                         StoryStorage,
                                         StoryStateMachine,
                                         localStorageService,
                                         $window,
                                         Auth,
                                         $stateParams,
                                         TextToSpeechPlayer,
                                         VideoPlayer,
                                         PageInfo) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('login');
  }

  $scope.framePreviewOptions = [
    {
      videoPlaying: false,
      showVideoSpinner: false
    },
    {
      videoPlaying: false,
      showVideoSpinner: false,
      audioPlaying: false,
      showAudioSpinner: false
    },
    {
      videoPlaying: false,
      showVideoSpinner: false,
      audioPlaying: false,
      showAudioSpinner: false
    },
    {
      videoPlaying: false,
      showVideoSpinner: false,
      audioPlaying: false,
      showAudioSpinner: false
    }
  ]

  $scope.addFrame0ImagePreview = false;

  $scope.addFrame1ImagePreview = false;

  $scope.addFrame2ImagePreview = false;

  $scope.addFrame3ImagePreview = false;

  $scope.addSoundtrack = false;
  $scope.audioButtonLabel = "Add Soundtrack";

  $scope.addAudio1 = false;
  $scope.addAudio2 = false;
  $scope.addAudio3 = false;
  $scope.audioAct1ButtonLabel = "Add Audio Track";
  $scope.audioAct2ButtonLabel = "Add Audio Track";
  $scope.audioAct3ButtonLabel = "Add Audio Track";

  $scope.addNarration1 = false;
  $scope.addNarration2 = false;
  $scope.addNarration3 = false;
  $scope.narration1ButtonLabel = "Add Narration";
  $scope.narration2ButtonLabel = "Add Narration";
  $scope.narration3ButtonLabel = "Add Narration";

  $scope.user = localStorageService.get('username');
  var token = localStorageService.get('sessiontoken');
  var wasPassed = ( !! $stateParams.storyId );

  if (wasPassed) {
    getUserLibrary($stateParams.storyId)
    .then(function() {

      var editStory = $scope.story;
      PageInfo.set({ 'title': 'Edit "' + editStory.title + '"' });
      var frames = editStory.frames;

      $scope.storyTitle = editStory.title;
      $scope.storyDescription = editStory.description;
      $scope.storyThumbnailUrl = editStory.thumbnail;

      var loadFrame = function(frame, index, collection) {
        for (var key in frame) {
          var name = 'frame' + index + key;
          $scope[name] = frame[key];
          // we should change mediatype to a string
          if (key === 'mediaType') {
            $scope[name] = frame[key] + "";
          }

          if (key === 'videoId' || key === 'audioId' && key !== "") {
            if (key === 'videoId') {
              name = 'frame' + index + 'youtubeUrl';
              $scope[name] = recreateVideoUrl(frame[key]);
            } else if (key === 'audioId') {
              name = 'frame' + index + 'audioUrl';
              $scope[name] = recreateVideoUrl(frame[key]);
            }
          }
        }
      }

      frames.forEach(loadFrame);
      // loadFrame(frames[1], 1);

      // // frame0 AUDIO
      if ($scope.frame0youtubeUrl !== "https://www.youtube.com/watch?v=") {
        $scope.addSoundtrack = true;
        $scope.audioButtonLabel = 'Remove Soundtrack';
      } else {
        $scope.frame0youtubeUrl = "";
        $scope.addSoundtrack = false;
        $scope.audioButtonLabel = "Add Soundtrack";
      }
      // frame1

      if ($scope.frame1narrationText !== "") {
        $scope.addNarration1 = true;
        $scope.narration1ButtonLabel = "Remove Narration";
       }

      if ($scope.frame1audioUrl !== 'https://www.youtube.com/watch?v=') {
        $scope.addAudio1 = true;
        $scope.audioAct1ButtonLabel = "Remove Audio Track";
      } else {
        // clear frame audio, needs function
        $scope.frame1audioUrl = ""
        $scope.addAudio1 = false;
        $scope.audioAct1ButtonLabel = "Add Audio Track";
        $scope.frame1audioStart = "0";
        $scope.frame1audioVolume = "100";
      }

      // frame 2
      if ($scope.frame2narrationText !== "") {
        $scope.addNarration2 = true;
        $scope.narration2ButtonLabel = "Remove Narration";
       }

      if ($scope.frame2audioUrl !== 'https://www.youtube.com/watch?v=') {
        $scope.addAudio2 = true;
        $scope.audioAct2ButtonLabel = "Remove Audio Track";
      } else {
        // clear frame audio, needs function
        $scope.frame2audioUrl = ""
        $scope.addAudio2 = false;
        $scope.audioAct2ButtonLabel = "Add Audio Track";
        $scope.frame2audioStart = "0";
        $scope.frame2audioVolume = "100";
      }

      // frame 3
      if ($scope.frame3narrationText !== "") {
        $scope.addNarration3 = true;
        $scope.narration3ButtonLabel = "Remove Narration";
       }

      if ($scope.frame3audioUrl !== 'https://www.youtube.com/watch?v=') {
        $scope.addAudio3 = true;
        $scope.audioAct3ButtonLabel = "Remove Audio Track";
      } else {
        // clear frame audio, needs function
        $scope.frame3audioUrl = ""
        $scope.addAudio3 = false;
        $scope.audioAct3ButtonLabel = "Add Audio Track";
        $scope.frame3audioStart = "0";
        $scope.frame3audioVolume = "100";
      }
    });
  }

  function getUserLibrary(storyId) {
    return StoryStorage.getStory(storyId)
    .then(function(resp) {
      $scope.story = resp.data;
    })
    .catch(function(error) {
      $state.go('errorPage');
    });
  }

  $scope.prepopulateInputs = function(){
    //TODO: remove once done with development
    $scope.storyTitle = "Panama ....";
    $scope.storyDescription = "Reach down ...";
    $scope.storyThumbnailUrl = "http://assets.rollingstone.com/assets/images/artists/van-halen.jpg";

    $scope.frame0youtubeUrl = "https://www.youtube.com/watch?v=fuKDBPw8wQA";
    $scope.frame0start = "0";
    $scope.frame0end = "180";
    $scope.frame0volume = "100";
    $scope.frame0imageUrl = null;
    $scope.frame0imageDuration = null;

    $scope.frame1mediaType = "0";
    $scope.frame1youtubeUrl = "https://www.youtube.com/watch?v=S7_Hr3iCPls";
    $scope.frame1start = "14";
    $scope.frame1end = "24";
    $scope.frame1volume = "0";
    $scope.frame1imageUrl = "http://i.imgur.com/7j15tXU.jpg";
    $scope.frame1imageDuration = 2;
    $scope.frame1narrationText = 'A long time ago, in a galaxy far, far away';
    $scope.frame1narrationDelay = 0;

    $scope.frame2mediaType = "1";
    $scope.frame2youtubeUrl = "https://www.youtube.com/watch?v=b8cCsUBYSkw";
    $scope.frame2start = "870";
    $scope.frame2end = "885";
    $scope.frame2volume = "30";
    $scope.frame2imageUrl = "http://gifstumblr.com/images/bird-vs-action-figure_1509.gif";
    $scope.frame2imageDuration = 3;
    $scope.frame2narrationText = 'Why don\'t you just tell me what movie you want to see!';
    $scope.frame2narrationDelay = 0;

    $scope.frame3mediaType = "2";
    $scope.frame3youtubeUrl = "https://www.youtube.com/watch?v=N9fbRcRJY34";
    $scope.frame3start = "0";
    $scope.frame3end = "13";
    $scope.frame3volume = "60";
    $scope.frame3imageUrl = "https://s-media-cache-ak0.pinimg.com/236x/9d/4c/ea/9d4cea965b2310610c99bc0eb72fe790.jpg";
    $scope.frame3imageDuration = 1;
    $scope.frame3narrationText = 'By Jove, I\'ve got a cheeky idea, let\'s have Milco solve the matrix.';
    $scope.frame3narrationDelay = 0;
  };

  $scope.checkRequiredFields = function(){
    var storyMetaInfoReady =
      $scope.storyTitle        &&
      $scope.storyDescription  &&
      $scope.storyThumbnailUrl;

    var video1InfoReady =
      $scope.frame1youtubeUrl &&
      $scope.frame1end;

    var image1InfoReady =
      $scope.frame1imageUrl &&
      $scope.frame1imageDuration;

    var textToSpeech1Ready =
      $scope.frame1narrationText;

    var frame1Ready =
      video1InfoReady ||
      image1InfoReady ||
      textToSpeech1Ready;

    var video2InfoReady =
      $scope.frame2youtubeUrl &&
      $scope.frame2end;

    var image2InfoReady =
      $scope.frame2imageUrl &&
      $scope.frame2imageDuration;

    var textToSpeech2Ready =
      $scope.frame2narrationText;

    var frame2Ready =
      video2InfoReady ||
      image2InfoReady ||
      textToSpeech2Ready;

    var video3InfoReady =
      $scope.frame3youtubeUrl &&
      $scope.frame3end;

    var image3InfoReady =
      $scope.frame3imageUrl &&
      $scope.frame3imageDuration;

    var textToSpeech3Ready =
      $scope.frame3narrationText;

    var frame3Ready =
      video3InfoReady ||
      image3InfoReady ||
      textToSpeech3Ready;

    var allFieldsReady =
      storyMetaInfoReady &&
      frame1Ready        &&
      frame2Ready        &&
      frame3Ready;

    return allFieldsReady;
  };

  $scope.saveStory = function(isPreviewModal){
    if(isPreviewModal){
      $scope.destroyFrames();
    }

    var story = {
      title: $scope.storyTitle,
      description: $scope.storyDescription,
      thumbnail: $scope.storyThumbnailUrl,
      username: $scope.user,
      author: "hardcoded author name",
      AUDIO0: 0,
      FRAME1: 1,
      FRAME2: 2,
      FRAME3: 3,
      frames: [
        {
          mediaType: parseInt($scope.frame0mediaType),
          player: null,
          playerDiv: 'player0',
          videoId: stripOutVideoIdFromUrl($scope.frame0youtubeUrl),
          start: $scope.frame0start ? parseFloat($scope.frame0start) : 0,
          end: $scope.frame0end ? parseFloat($scope.frame0end) : 0,
          volume: parseInt($scope.frame0volume),
          imageUrl: $scope.frame0imageUrl,
          imageDuration: $scope.frame0imageDuration ? parseFloat($scope.frame0imageDuration) : 0,
          /* Not applicable $scope.frame0narrationText*/
          narrationText: null,
          narrationDelay: 0
        },
        {
          mediaType: parseInt($scope.frame1mediaType),
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1youtubeUrl),
          start: $scope.frame1start ? parseFloat($scope.frame1start) : 0,
          end: $scope.frame1end ? parseFloat($scope.frame1end) : 0,
          volume: parseInt($scope.frame1volume),
          previewUrl: (wasPassed)? $scope.story.frames[1].previewUrl: "",
          imageUrl: $scope.frame1imageUrl,
          imageDuration: $scope.frame1imageDuration ? parseFloat($scope.frame1imageDuration) : 0,
          audioId: stripOutVideoIdFromUrl($scope.frame1audioUrl),
          audioStart: ($scope.frame1audioStart) ?
                        parseFloat($scope.frame1audioStart) :
                        0,
          audioVolume: ($scope.frame1audioVolume) ?
                        parseFloat($scope.frame1audioVolume) :
                        0,
          narrationText: $scope.frame1narrationText,
          narrationDelay: $scope.frame1narrationDelay ? parseFloat($scope.frame1narrationDelay) : 0
        },
        {
          mediaType: parseInt($scope.frame2mediaType),
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2youtubeUrl),
          start: $scope.frame2start ? parseFloat($scope.frame2start) : 0,
          end: $scope.frame2end ? parseFloat($scope.frame2end) : 0,
          volume: parseInt($scope.frame2volume),
          previewUrl: (wasPassed)? $scope.story.frames[2].previewUrl: "",
          imageUrl: $scope.frame2imageUrl,
          imageDuration: $scope.frame2imageDuration ? parseFloat($scope.frame2imageDuration) : 0,
          audioId: stripOutVideoIdFromUrl($scope.frame2audioUrl),
          audioStart: ($scope.frame2audioStart) ?
                        parseFloat($scope.frame2audioStart) :
                        0,
          audioVolume: ($scope.frame2audioVolume) ?
                        parseFloat($scope.frame2audioVolume) :
                        0,
          narrationText: $scope.frame2narrationText,
          narrationDelay: $scope.frame2narrationDelay ? parseFloat($scope.frame2narrationDelay) : 0
        },
        {
          mediaType: parseInt($scope.frame3mediaType),
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3youtubeUrl),
          start: $scope.frame3start ? parseFloat($scope.frame3start) : 0,
          end: $scope.frame3end ? parseFloat($scope.frame3end) : 0,
          volume: parseInt($scope.frame3volume),
          previewUrl: (wasPassed)? $scope.story.frames[3].previewUrl: "",
          imageUrl: $scope.frame3imageUrl,
          imageDuration: $scope.frame3imageDuration ? parseFloat($scope.frame3imageDuration) : 0,
          audioId: stripOutVideoIdFromUrl($scope.frame3audioUrl),
          audioStart: ($scope.frame3audioStart) ?
                        parseFloat($scope.frame3audioStart) :
                        0,
          audioVolume: ($scope.frame3audioVolume) ?
                        parseFloat($scope.frame3audioVolume) :
                        0,
          narrationText: $scope.frame3narrationText,
          narrationDelay: $scope.frame3narrationDelay ? parseFloat($scope.frame3narrationDelay) : 0
        }
      ]
    };

    if (wasPassed) {
      StoryStorage.editStory(story, $scope.story.storyId, token)
        .then(function (data) {
          $state.go('library');
      });
    } else {
      StoryStorage.saveStory(story, token)
        .then(function (data) {
          $state.go('library');
        });
    }
  };

  $scope.previewStory = function () {
    var story = {
      AUDIO0: 0,
      FRAME1: 1,
      FRAME2: 2,
      FRAME3: 3,
      hasSoundtrack: $scope.frame0youtubeUrl !== '' && $scope.frame0youtubeUrl !== null,
      frames: [
        {
          mediaType: parseInt($scope.frame0mediaType),
          player: null,
          playerDiv: 'player0',
          videoId: stripOutVideoIdFromUrl($scope.frame0youtubeUrl),
          start: $scope.frame0start,
          end: $scope.frame0end,
          volume: $scope.frame0volume,
          imageUrl: $scope.frame0imageUrl,
          imageDuration: $scope.frame0imageDuration,
          /* Not applicable $scope.frame0narrationText*/
          narrationText: null ,
          narrationDelay: null
        },
        {
          mediaType: parseInt($scope.frame1mediaType),
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1youtubeUrl),
          start: $scope.frame1start,
          end: $scope.frame1end,
          volume: $scope.frame1volume,
          imageUrl: $scope.frame1imageUrl,
          imageDuration: $scope.frame1imageDuration,
          audioId: stripOutVideoIdFromUrl($scope.frame1audioUrl),
          audioStart: $scope.frame1audioStart ?
                        parseFloat($scope.frame1audioStart) :
                        0,
          audioVolume: ($scope.frame1audioVolume) ?
                        parseFloat($scope.frame1audioVolume) :
                        0,
          narrationText: $scope.frame1narrationText,
          narrationDelay: $scope.frame1narrationDelay
        },
        {
          mediaType: parseInt($scope.frame2mediaType),
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2youtubeUrl),
          start: $scope.frame2start,
          end: $scope.frame2end,
          volume: $scope.frame2volume,
          imageUrl: $scope.frame2imageUrl,
          imageDuration: $scope.frame2imageDuration,
          audioId: stripOutVideoIdFromUrl($scope.frame2audioUrl),
          audioStart: ($scope.frame2audioStart) ?
                        parseFloat($scope.frame2audioStart) :
                        0,
          audioVolume: ($scope.frame2audioVolume) ?
                        parseFloat($scope.frame2audioVolume) :
                        0,
          narrationText: $scope.frame2narrationText,
          narrationDelay: $scope.frame2narrationDelay
        },
        {
          mediaType: parseInt($scope.frame3mediaType),
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3youtubeUrl),
          start: $scope.frame3start,
          end: $scope.frame3end,
          volume: $scope.frame3volume,
          imageUrl: $scope.frame3imageUrl,
          imageDuration: $scope.frame3imageDuration,
          audioId: stripOutVideoIdFromUrl($scope.frame3audioUrl),
          audioStart: ($scope.frame3audioStart) ?
                        parseFloat($scope.frame3audioStart) :
                        0,
          audioVolume: ($scope.frame3audioVolume) ?
                        parseFloat($scope.frame3audioVolume) :
                        0,
          narrationText: $scope.frame3narrationText,
          narrationDelay: $scope.frame3narrationDelay
        }
      ]
    };
    var isSingleStoryView = false;
    var scope = null;
    StoryStateMachine.setStory(story, isSingleStoryView, scope);
  };

  $scope.destroyFrames = function(){
    StoryStateMachine.endStory();
  };

  var framePlayers = {
    frame0: null,
    frame1: null,
    frame2: null,
    frame3: null
  };

  $scope.previewFrame = function(frameId) {
    $scope.framePreviewOptions[frameId].videoPlaying = true;
    $scope.framePreviewOptions[frameId].showVideoSpinner = true;

    var frameyoutubeUrl = null;
    var framestart = null;
    var frameend = null;
    var frameVolume = null;
    var frameDivId = null;
    var framePlayerName = null;

    switch(frameId){
      case 0:
        frameyoutubeUrl = $scope.frame0youtubeUrl;
        framestart = $scope.frame0start;
        frameend = $scope.frame0end;
        frameVolume = $scope.frame0volume;
        frameDivId = 'frame0preview';
        framePlayerName = 'frame0';
        break;
      case 1:
        frameyoutubeUrl = $scope.frame1youtubeUrl;
        framestart = $scope.frame1start;
        frameend = $scope.frame1end;
        frameVolume = $scope.frame1volume;
        frameDivId = 'frame1preview';
        framePlayerName = 'frame1';
        break;
      case 2:
        frameyoutubeUrl = $scope.frame2youtubeUrl;
        framestart = $scope.frame2start;
        frameend = $scope.frame2end;
        frameVolume = $scope.frame2volume;
        frameDivId = 'frame2preview';
        framePlayerName = 'frame2';
        break;
      case 3:
        frameyoutubeUrl = $scope.frame3youtubeUrl;
        framestart = $scope.frame3start;
        frameend = $scope.frame3end;
        frameVolume = $scope.frame3volume;
        frameDivId = 'frame3preview';
        framePlayerName = 'frame3';
        break;
    }

    var videoId = stripOutVideoIdFromUrl(frameyoutubeUrl);

    var currentFrameObject = {
      playerDiv: frameDivId,
      videoId: videoId,
      start: framestart,
      end: frameend,
      volume: frameVolume,
      playerName: framePlayerName
    };

    var currentFrameInfo = {
      frameId: frameId,
      frameType: 'video'
    };

    previewAudioVideoFrame(currentFrameObject, currentFrameInfo);
  };

  $scope.previewAudioFrame = function(frameId) {
    $scope.framePreviewOptions[frameId].audioPlaying = true;
    $scope.framePreviewOptions[frameId].showAudioSpinner = true;

    var frameyoutubeUrl = null;
    var framestart = null;
    var frameend = null;
    var frameVolume = null;
    var frameDivId = null;
    var framePlayerName = null;

    switch(frameId){
      case 1:
        frameyoutubeUrl = $scope.frame1audioUrl;
        framestart = $scope.frame1audioStart;
        frameend = $scope.frame1end;
        frameVolume = $scope.frame1audioVolume;
        frameDivId = 'frame1previewAudio';
        framePlayerName = 'frame1';
        break;
      case 2:
        frameyoutubeUrl = $scope.frame2audioUrl;
        framestart = $scope.frame2audioStart;
        frameend = $scope.frame2end;
        frameVolume = $scope.frame2audioVolume;
        frameDivId = 'frame2previewAudio';
        framePlayerName = 'frame2';
        break;
      case 3:
        frameyoutubeUrl = $scope.frame3audioUrl;
        framestart = $scope.frame3audioStart;
        frameend = $scope.frame3end;
        frameVolume = $scope.frame3audioVolume;
        frameDivId = 'frame3previewAudio';
        framePlayerName = 'frame3';
        break;
    }

    var videoId = stripOutVideoIdFromUrl(frameyoutubeUrl);

    var currentFrame = {
      playerDiv: frameDivId,
      videoId: videoId,
      start: framestart,
      end: frameend,
      volume: frameVolume,
      playerName: framePlayerName
    };

    var currentFrameInfo = {
      frameId: frameId,
      frameType: 'audio'
    };

    previewAudioVideoFrame(currentFrame, currentFrameInfo);
  };

  var stripOutVideoIdFromUrl = function(url){
    if( ! url) return url;

    var videoId = url.split('v=')[1];
    var ampersandIndex = videoId.indexOf('&');
    if(ampersandIndex !== -1){
      videoId = videoId.substring(0, ampersandIndex);
    }

    return videoId;
  };

  function recreateVideoUrl(youtubeID) {
    var header = "https://www.youtube.com/watch?v=";
    return header + youtubeID;
  }

  var previewAudioVideoFrame = function(currentFrameObject, currentFrameInfo) {
    var frameId = currentFrameInfo.frameId;
    var frameType = currentFrameInfo.frameType;

    var previewAudioVideoPlayer = new VideoPlayer();
    var readyCallback = function () {};
    var playbackFinishedCallback = function () {};
    var playingCallback = function () {};

    switch (frameType) {
    case 'video':
      readyCallback = function() {
        $scope.$apply(function() {
          $scope.framePreviewOptions[frameId].showVideoSpinner = false;
        });
        previewAudioVideoPlayer.play();
      };
      playbackFinishedCallback = function() {
        $scope.$apply(function() {
          $scope.framePreviewOptions[frameId].videoPlaying = false;
        });
        previewAudioVideoPlayer.destroy();
      };
      break;
    case 'audio':
      readyCallback = function() {
        $scope.$apply(function() {
          $scope.framePreviewOptions[frameId].showAudioSpinner = false;
        });
        previewAudioVideoPlayer.play();
      };
      playbackFinishedCallback = function() {
        $scope.$apply(function() {
          $scope.framePreviewOptions[frameId].audioPlaying = false;
        });
        previewAudioVideoPlayer.destroy();
      };
      break;
    }

    previewAudioVideoPlayer.create(currentFrameObject,
                                     readyCallback,
                                     playbackFinishedCallback,
                                     playingCallback);
  };

  $scope.previewImageFrame = function(frameId){
    switch(frameId){
      case 0:
        throw('Whoa, amazing, you put an image in an audio track');
        //break; jshint complains that this break is unreachable, which is true
      case 1:
        $scope.addFrame1ImagePreview = !$scope.addFrame1ImagePreview;
        break;
      case 2:
        $scope.addFrame2ImagePreview = !$scope.addFrame2ImagePreview;
        break;
      case 3:
        $scope.addFrame3ImagePreview = !$scope.addFrame3ImagePreview;
        break;
    }
  };

  $scope.previewTextToSpeechFrame = function(frameId){
    var framenarrationText = null;
    switch(frameId){
      case 1:
        framenarrationText = $scope.frame1narrationText;
        break;
      case 2:
        framenarrationText = $scope.frame2narrationText;
        break;
      case 3:
        framenarrationText = $scope.frame3narrationText;
        break;
    }
    var tempStoryFrame = {
      narrationText: framenarrationText
    };
    var previewTextToSpeechPlayer = new TextToSpeechPlayer();
    var readyCallback =
      previewTextToSpeechPlayer.play.bind(previewTextToSpeechPlayer);
    var playbackFinishedCallback =
      previewTextToSpeechPlayer.destroy.bind(previewTextToSpeechPlayer);

    previewTextToSpeechPlayer.create(tempStoryFrame,
                                     readyCallback,
                                     playbackFinishedCallback);
  };

  $scope.toggleSoundtrack = function () {
    $scope.addSoundtrack = !$scope.addSoundtrack;
    if ($scope.addSoundtrack) {
      $scope.audioButtonLabel = "Remove Soundtrack";
    } else {
      $scope.audioButtonLabel = "Add Soundtrack";
      $scope.frame0mediaType = 3;
      $scope.frame0youtubeUrl = null;
      $scope.frame0start = "0";
      $scope.frame0end = null;
      $scope.frame0volume = "100";
      $scope.frame0imageUrl = null;
      $scope.frame0imageDuration = null;
    }
  };

  $scope.toggleActAudioTrack = function (frameId) {
    switch (frameId) {
    case 1:
      $scope.addAudio1 = !$scope.addAudio1;
      if ($scope.addAudio1) {
        $scope.audioAct1ButtonLabel = "Remove Audio Track";
      } else {
        $scope.audioAct1ButtonLabel = "Add Audio Track";
        $scope.frame1audioUrl = null;
        $scope.frame1audioStart = null;
        $scope.frame1audioVolume = null;
      }
      break;
    case 2:
      $scope.addAudio2 = !$scope.addAudio2;
      if ($scope.addAudio2) {
        $scope.audioAct2ButtonLabel = "Remove Audio";
      } else {
        $scope.audioAct2ButtonLabel = "Add Audio Track";
        $scope.frame2audioUrl = null;
        $scope.frame2audioStart = null;
        $scope.frame2audioVolume = null;
      }
      break;
    case 3:
      $scope.addAudio3 = !$scope.addAudio3;
      if ($scope.addAudio3) {
        $scope.audioAct3ButtonLabel = "Remove Audio";
      } else {
        $scope.audioAct3ButtonLabel = "Add Audio Track";
        $scope.frame3audioUrl = null;
        $scope.frame3audioStart = null;
        $scope.frame3audioVolume = null;
      }
      break;
    }
  };

  $scope.toggleNarration = function (frameId) {
    switch (frameId) {
    case 1:
      $scope.addNarration1 = !$scope.addNarration1;
      if ($scope.addNarration1) {
        $scope.narration1ButtonLabel = "Remove Narration";
      } else {
        $scope.narration1ButtonLabel = "Add Narration";
        $scope.frame1narrationText = null;
        $scope.frame1narrationDelay = 0;
      }
      break;
    case 2:
      $scope.addNarration2 = !$scope.addNarration2;
      if ($scope.addNarration2) {
        $scope.narration2ButtonLabel = "Remove Narration";
      } else {
        $scope.narration2ButtonLabel = "Add Narration";
        $scope.frame2narrationText = null;
        $scope.frame2narrationDelay = 0;
      }
      break;
    case 3:
      $scope.addNarration3 = !$scope.addNarration3;
      if ($scope.addNarration3) {
        $scope.narration3ButtonLabel = "Remove Narration";
      } else {
        $scope.narration3ButtonLabel = "Add Narration";
        $scope.frame3narrationText = null;
        $scope.frame3narrationDelay = 0;
      }
      break;
    }
  };

});
