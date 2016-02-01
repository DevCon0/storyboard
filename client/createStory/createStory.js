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
                                         VideoPlayer) {

  if ( ! (Auth.isAuth()) ) {
    $state.go('login')
  }

  $scope.showSpinner0 = false;
  $scope.addFrame0ImagePreview = false;

  $scope.showSpinner1 = false;
  $scope.addFrame1ImagePreview = false;

  $scope.showSpinner2 = false;
  $scope.addFrame2ImagePreview = false;

  $scope.showSpinner3 = false;
  $scope.addFrame3ImagePreview = false;

  $scope.addSoundtrack = false;
  $scope.audioTrackDisplay = "Add Soundtrack";

  $scope.addNarration1 = false;
  $scope.addNarration2 = false;
  $scope.addNarration3 = false;
  $scope.narration1Display = "Add Narration";
  $scope.narration2Display = "Add Narration";
  $scope.narration3Display = "Add Narration";

  $scope.user = localStorageService.get('username');
  var token = localStorageService.get('sessiontoken');
  var wasPassed = Object.keys($stateParams.story).length !== 0;

  if (wasPassed) {
    var editStory = $stateParams.story;
    $scope.storyTitle = editStory.title;
    $scope.storyDescription = editStory.description;
    $scope.storyThumbnailUrl = editStory.thumbnail;

    // media type is always 3 for frame0 and is set on save, and confirmed here
    $scope.frame0MediaType = editStory.frames[0].mediaType;
    // test for videoId to show or hide in create/edit view
    if (editStory.frames[0].videoId !== "") {
      $scope.frame0YoutubeUrl = recreateVideoUrl(editStory.frames[0].videoId);
      $scope.addSoundtrack = true;
    } else {
      $scope.frame0YoutubeUrl = "";
      $scope.addSoundtrack = false;
    }
    $scope.frame0StartTime = editStory.frames[0].start;
    $scope.frame0EndTime = editStory.frames[0].end;
    $scope.frame0Volume = editStory.frames[0].volume;
    $scope.frame0ImageUrl = editStory.frames[0].imageUrl;
    $scope.frame0UrlDuration = editStory.frames[0].imageDuration;
    // Not applicable $scope.frame0NarrationText

    // TODO: remove backwards compatibility
    if(editStory.frames[1].mediaType !== undefined) {
      $scope.frame1MediaType = "" + editStory.frames[1].mediaType;
    } else {
      $scope.frame1MediaType = null;
    }
    $scope.frame1YoutubeUrl = recreateVideoUrl(editStory.frames[1].videoId);
    $scope.frame1StartTime = editStory.frames[1].start;
    $scope.frame1EndTime = editStory.frames[1].end;
    $scope.frame1Volume = editStory.frames[1].volume;
    $scope.frame1ImageUrl = editStory.frames[1].imageUrl;
    $scope.frame1UrlDuration = editStory.frames[1].imageDuration;
    $scope.frame1NarrationText = editStory.frames[1].narrationText;
    $scope.frame1NarrationDelay = editStory.frames[1].narrationDelay;

    // TODO: remove backwards compatibility
    if(editStory.frames[2].mediaType !== undefined) {
      $scope.frame2MediaType = "" + editStory.frames[2].mediaType;
    } else {
      $scope.frame2MediaType = null;
    }
    $scope.frame2YoutubeUrl = recreateVideoUrl(editStory.frames[2].videoId);
    $scope.frame2StartTime = editStory.frames[2].start;
    $scope.frame2EndTime = editStory.frames[2].end;
    $scope.frame2Volume = editStory.frames[2].volume;
    $scope.frame2ImageUrl = editStory.frames[2].imageUrl;
    $scope.frame2UrlDuration = editStory.frames[2].imageDuration;
    $scope.frame2NarrationText = editStory.frames[2].narrationText;
    $scope.frame2NarrationDelay = editStory.frames[2].narrationDelay;

    // TODO: remove backwards compatibility
    if(editStory.frames[3].mediaType !== undefined) {
      $scope.frame3MediaType = "" + editStory.frames[3].mediaType;
    } else {
      $scope.frame3MediaType = null;
    }
    $scope.frame3YoutubeUrl = recreateVideoUrl(editStory.frames[3].videoId);
    $scope.frame3StartTime = editStory.frames[3].start;
    $scope.frame3EndTime = editStory.frames[3].end;
    $scope.frame3Volume = editStory.frames[3].volume;
    $scope.frame3ImageUrl = editStory.frames[3].imageUrl;
    $scope.frame3UrlDuration = editStory.frames[3].imageDuration;
    $scope.frame3NarrationText = editStory.frames[3].narrationText;
    $scope.frame3NarrationDelay = editStory.frames[3].narrationDelay;
  } else {
    $scope.storyTitle = null;
    $scope.storyDescription = null;
    $scope.storyThumbnailUrl = null;

    $scope.frame0MediaType = 3;
    $scope.frame0YoutubeUrl = null;
    $scope.frame0StartTime = "0";
    $scope.frame0EndTime = null;
    $scope.frame0Volume = "100";
    $scope.frame0ImageUrl = null;
    $scope.frame0UrlDuration = null;
    // Not applicable $scope.frame0NarrationText

    $scope.frame1MediaType = null;
    $scope.frame1YoutubeUrl = null;
    $scope.frame1StartTime = "0";
    $scope.frame1EndTime = null;
    $scope.frame1Volume = "100";
    $scope.frame1ImageUrl = null;
    $scope.frame1UrlDuration = null;
    $scope.frame1NarrationText = null;
    $scope.frame1NarrationDelay = null;

    $scope.frame2MediaType = null;
    $scope.frame2YoutubeUrl = null;
    $scope.frame2StartTime = "0";
    $scope.frame2EndTime = null;
    $scope.frame2Volume = "100";
    $scope.frame2ImageUrl = null;
    $scope.frame2UrlDuration = null;
    $scope.frame2NarrationText = null;
    $scope.frame2NarrationDelay = null;

    $scope.frame3MediaType = null;
    $scope.frame3YoutubeUrl = null;
    $scope.frame3StartTime = "0";
    $scope.frame3EndTime = null;
    $scope.frame3Volume = "100";
    $scope.frame3ImageUrl = null;
    $scope.frame3UrlDuration = null;
    $scope.frame3NarrationText = null;
    $scope.frame3NarrationDelay = null;
  }

  $scope.prepopulateInputs = function(){
    //TODO: remove once done with development
    $scope.storyTitle = "Panama ....";
    $scope.storyDescription = "Reach down ...";
    $scope.storyThumbnailUrl = "http://assets.rollingstone.com/assets/images/artists/van-halen.jpg"

    $scope.frame0YoutubeUrl = "https://www.youtube.com/watch?v=fuKDBPw8wQA";
    $scope.frame0StartTime = "0";
    $scope.frame0EndTime = "180";
    $scope.frame0Volume = "100";
    $scope.frame0ImageUrl = null;
    $scope.frame0UrlDuration = null;

    $scope.frame1MediaType = "0";
    $scope.frame1YoutubeUrl = "https://www.youtube.com/watch?v=S7_Hr3iCPls";
    $scope.frame1StartTime = "14";
    $scope.frame1EndTime = "24";
    $scope.frame1Volume = "0";
    $scope.frame1ImageUrl = "http://i.imgur.com/7j15tXU.jpg";
    $scope.frame1UrlDuration = 2;
    $scope.frame1NarrationText = 'A long time ago, in a galaxy far, far away';

    $scope.frame2MediaType = "1";
    $scope.frame2YoutubeUrl = "https://www.youtube.com/watch?v=b8cCsUBYSkw";
    $scope.frame2StartTime = "870";
    $scope.frame2EndTime = "885";
    $scope.frame2Volume = "30";
    $scope.frame2ImageUrl = "http://gifstumblr.com/images/bird-vs-action-figure_1509.gif";
    $scope.frame2UrlDuration = 3;
    $scope.frame2NarrationText = 'Why don\'t you just tell me what movie you want to see!';

    $scope.frame3MediaType = "2";
    $scope.frame3YoutubeUrl = "https://www.youtube.com/watch?v=N9fbRcRJY34";
    $scope.frame3StartTime = "0";
    $scope.frame3EndTime = "13";
    $scope.frame3Volume = "60"
    $scope.frame3ImageUrl = "https://s-media-cache-ak0.pinimg.com/236x/9d/4c/ea/9d4cea965b2310610c99bc0eb72fe790.jpg";
    $scope.frame3UrlDuration = 1;
    $scope.frame3NarrationText = 'By Jove, I\'ve got a cheeky idea, let\'s have Milco solve the matrix.';
  };

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

    var textToSpeech1Ready =
      $scope.frame1NarrationText;

    var frame1Ready =
      video1InfoReady ||
      image1InfoReady ||
      textToSpeech1Ready;

    var video2InfoReady =
      $scope.frame2YoutubeUrl &&
      $scope.frame2EndTime;

    var image2InfoReady =
      $scope.frame2ImageUrl &&
      $scope.frame2UrlDuration;

    var textToSpeech2Ready =
      $scope.frame2NarrationText;

    var frame2Ready =
      video2InfoReady ||
      image2InfoReady ||
      textToSpeech2Ready;

    var video3InfoReady =
      $scope.frame3YoutubeUrl &&
      $scope.frame3EndTime;

    var image3InfoReady =
      $scope.frame3ImageUrl &&
      $scope.frame3UrlDuration;

    var textToSpeech3Ready =
      $scope.frame3NarrationText;

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
  }

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
          mediaType: parseInt($scope.frame0MediaType),
          player: null,
          playerDiv: 'player0',
          videoId: stripOutVideoIdFromUrl($scope.frame0YoutubeUrl),
          start: $scope.frame0StartTime ? parseFloat($scope.frame0StartTime) : 0,
          end: $scope.frame0EndTime ? parseFloat($scope.frame0EndTime) : 0,
          volume: parseInt($scope.frame0Volume),
          imageUrl: $scope.frame0ImageUrl,
          imageDuration: $scope.frame0UrlDuration ? parseFloat($scope.frame0UrlDuration) : 0,
          /* Not applicable $scope.frame0NarrationText*/
          narrationText: null,
          narrationDelay: null
        },
        {
          mediaType: parseInt($scope.frame1MediaType),
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: $scope.frame1StartTime ? parseFloat($scope.frame1StartTime) : 0,
          end: $scope.frame1EndTime ? parseFloat($scope.frame1EndTime) : 0,
          volume: parseInt($scope.frame1Volume),
          previewUrl: (wasPassed)? $stateParams.story.frames[1].previewUrl: "",
          imageUrl: $scope.frame1ImageUrl,
          imageDuration: $scope.frame1UrlDuration ? parseFloat($scope.frame1UrlDuration) : 0,
          narrationText: $scope.frame1NarrationText,
          narrationDelay: $scope.frame1NarrationDelay ? parseFloat($scope.frame1NarrationDelay) : 0
        },
        {
          mediaType: parseInt($scope.frame2MediaType),
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: $scope.frame2StartTime ? parseFloat($scope.frame2StartTime) : 0,
          end: $scope.frame2EndTime ? parseFloat($scope.frame2EndTime) : 0,
          volume: parseInt($scope.frame2Volume),
          previewUrl: (wasPassed)? $stateParams.story.frames[2].previewUrl: "",
          imageUrl: $scope.frame2ImageUrl,
          imageDuration: $scope.frame2UrlDuration ? parseFloat($scope.frame2UrlDuration) : 0,
          narrationText: $scope.frame2NarrationText,
          narrationDelay: $scope.frame2NarrationDelay ? parseFloat($scope.frame2NarrationDelay) : 0
        },
        {
          mediaType: parseInt($scope.frame3MediaType),
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: $scope.frame3StartTime ? parseFloat($scope.frame3StartTime) : 0,
          end: $scope.frame3EndTime ? parseFloat($scope.frame3EndTime) : 0,
          volume: parseInt($scope.frame3Volume),
          previewUrl: (wasPassed)? $stateParams.story.frames[3].previewUrl: "",
          imageUrl: $scope.frame3ImageUrl,
          imageDuration: $scope.frame3UrlDuration ? parseFloat($scope.frame3UrlDuration) : 0,
          narrationText: $scope.frame3NarrationText,
          narrationDelay: $scope.frame3NarrationDelay ? parseFloat($scope.frame3NarrationDelay) : 0
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
  };

  $scope.previewStory = function () {
    var story = {
      AUDIO0: 0,
      FRAME1: 1,
      FRAME2: 2,
      FRAME3: 3,
      hasSoundtrack: $scope.frame0YoutubeUrl !== '' && $scope.frame0YoutubeUrl !== null,
      frames: [
        {
          mediaType: parseInt($scope.frame0MediaType),
          player: null,
          playerDiv: 'player0',
          videoId: stripOutVideoIdFromUrl($scope.frame0YoutubeUrl),
          start: $scope.frame0StartTime,
          end: $scope.frame0EndTime,
          volume: $scope.frame0Volume,
          imageUrl: $scope.frame0ImageUrl,
          imageDuration: $scope.frame0UrlDuration,
          /* Not applicable $scope.frame0NarrationText*/
          narrationText: null ,
          narrationDelay: null
        },
        {
          mediaType: parseInt($scope.frame1MediaType),
          player: null,
          playerDiv: 'player1',
          videoId: stripOutVideoIdFromUrl($scope.frame1YoutubeUrl),
          start: $scope.frame1StartTime,
          end: $scope.frame1EndTime,
          volume: $scope.frame1Volume,
          imageUrl: $scope.frame1ImageUrl,
          imageDuration: $scope.frame1UrlDuration,
          narrationText: $scope.frame1NarrationText,
          narrationText: $scope.frame1NarrationDelay
        },
        {
          mediaType: parseInt($scope.frame2MediaType),
          player: null,
          playerDiv: 'player2',
          videoId: stripOutVideoIdFromUrl($scope.frame2YoutubeUrl),
          start: $scope.frame2StartTime,
          end: $scope.frame2EndTime,
          volume: $scope.frame2Volume,
          imageUrl: $scope.frame2ImageUrl,
          imageDuration: $scope.frame2UrlDuration,
          narrationText: $scope.frame2NarrationText,
          narrationDelay: $scope.frame1NarrationDelay
        },
        {
          mediaType: parseInt($scope.frame3MediaType),
          player: null,
          playerDiv: 'player3',
          videoId: stripOutVideoIdFromUrl($scope.frame3YoutubeUrl),
          start: $scope.frame3StartTime,
          end: $scope.frame3EndTime,
          volume: $scope.frame3Volume,
          imageUrl: $scope.frame3ImageUrl,
          imageDuration: $scope.frame3UrlDuration,
          narrationText: $scope.frame3NarrationText,
          narrationDelay: $scope.frame3NarrationDelay
        }
      ]
    }
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
    var frameYoutubeUrl = null;
    var frameStartTime = null;
    var frameEndTime = null;
    var frameVolume = null;
    var frameDivId = null;
    var framePlayerName = null;
    console.log('prev frameId', frameId)
    switch(frameId){
      case 0:
        frameYoutubeUrl = $scope.frame0YoutubeUrl;
        frameStartTime = $scope.frame0StartTime;
        frameEndTime = $scope.frame0EndTime;
        frameVolume = $scope.frame0Volume;
        frameDivId = 'frame0Preview';
        framePlayerName = 'frame0';
        $scope.showSpinner0 = true;
        break;
      case 1:
        frameYoutubeUrl = $scope.frame1YoutubeUrl;
        frameStartTime = $scope.frame1StartTime;
        frameEndTime = $scope.frame1EndTime;
        frameVolume = $scope.frame1Volume;
        frameDivId = 'frame1Preview';
        framePlayerName = 'frame1';
        $scope.showSpinner1 = true;
        break;
      case 2:
        frameYoutubeUrl = $scope.frame2YoutubeUrl;
        frameStartTime = $scope.frame2StartTime;
        frameEndTime = $scope.frame2EndTime;
        frameVolume = $scope.frame2Volume;
        frameDivId = 'frame2Preview';
        framePlayerName = 'frame2';
        $scope.showSpinner2 = true;
        break;
      case 3:
        frameYoutubeUrl = $scope.frame3YoutubeUrl;
        frameStartTime = $scope.frame3StartTime;
        frameEndTime = $scope.frame3EndTime;
        frameVolume = $scope.frame3Volume;
        frameDivId = 'frame3Preview';
        framePlayerName = 'frame3';
        $scope.showSpinner3 = true;
        break;
    }

    var videoId = stripOutVideoIdFromUrl(frameYoutubeUrl);

    var currentFrame = {
      playerDiv: frameDivId,
      videoId: videoId,
      start: frameStartTime,
      end: frameEndTime,
      volume: frameVolume,
      playerName: framePlayerName
    };

    previewAudioVideoFrame(currentFrame);
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
  };


  var previewAudioVideoFrame = function(currentFrameObject) {
    var previewAudioVideoPlayer = new VideoPlayer();
    var readyCallback =
      previewAudioVideoPlayer.play.bind(previewAudioVideoPlayer);
    var playbackFinishedCallback =
      previewAudioVideoPlayer.destroy.bind(previewAudioVideoPlayer);
    var playingCallback = function () {};

    $scope.showSpinner0 = false;
    $scope.showSpinner1 = false;
    $scope.showSpinner2 = false;
    $scope.showSpinner3 = false;

    previewAudioVideoPlayer.create(currentFrameObject,
                                     readyCallback,
                                     playbackFinishedCallback,
                                     playingCallback);
  };

  $scope.previewImageFrame = function(frameId){
    switch(frameId){
      case 0:
        throw('Whoa, amazing, you put an image in an audio track');
        break;
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
    var frameNarrationText = null;
    switch(frameId){
      case 1:
        frameNarrationText = $scope.frame1NarrationText;
        break;
      case 2:
        frameNarrationText = $scope.frame2NarrationText;
        break;
      case 3:
        frameNarrationText = $scope.frame3NarrationText;
        break;
    }
    var tempStoryFrame = {
      narrationText: frameNarrationText
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
      $scope.audioTrackDisplay = "Destory Soundtrack";
    } else {
      $scope.audioTrackDisplay = "Add Soundtrack";
      $scope.frame0MediaType = 3;
      $scope.frame0YoutubeUrl = null;
      $scope.frame0StartTime = "0";
      $scope.frame0EndTime = null;
      $scope.frame0Volume = "100";
      $scope.frame0ImageUrl = null;
      $scope.frame0UrlDuration = null;
    }
  };

  $scope.toggleNarration = function (frameId) {
    switch (frameId) {
    case 1:
      $scope.addNarration1 = !$scope.addNarration1;
      if ($scope.addNarration1) {
        $scope.narration1Display = "Remove Narration";
      } else {
        $scope.narration1Display = "Add Narration";
        $scope.frame1NarrationText = null;
        $scope.frame1NarrationDelay = null;
      }
      break;
    case 2:
      $scope.addNarration2 = !$scope.addNarration2;
      if ($scope.addNarration2) {
        $scope.narration2Display = "Remove Narration";
      } else {
        $scope.narration2Display = "Add Narration";
        $scope.frame2NarrationText = null;
        $scope.frame2NarrationDelay = null;
      }
      break;
    case 3:
      $scope.addNarration3 = !$scope.addNarration3;
      if ($scope.addNarration3) {
        $scope.narration3Display = "Remove Narration";
      } else {
        $scope.narration3Display = "Add Narration";
        $scope.frame3NarrationText = null;
        $scope.frame3NarrationDelay = null;
      }
      break;
    }
  }

});

