angular.module('storyBoard.storyStateMachineService',
  ['storyBoard.videoPlayer',
   'storyBoard.imagePlayer',
   'storyBoard.textToSpeechPlayer'])

.factory('StoryStateMachine', function(VideoPlayer, ImagePlayer, TextToSpeechPlayer){
  var storyStateMachine = {};
  storyStateMachine.story = null;
  var closureIsSingleStoryView = false;
  var closureStoryHasEnded = false;
  storyStateMachine.players = [];
  var parentControllerScope = null;
  var AUDIO = 0;
  var FIRST = 1;
  var SECOND = 2;
  var THIRD = 3;

  storyStateMachine.setStory = function(story, isSingleStoryView, scope){
    this.story = story;
    console.log('story in storyStateMachine:', story);
    closureStoryHasEnded = false;
    closureIsSingleStoryView = isSingleStoryView;
    parentControllerScope = scope;
    var storyFrames = story.frames;
    var hasSoundtrack = this.story.hasSoundtrack;
    // Start with last frame and go backwards
    // because each player receives a play call
    // from the player ahead of it.  There could
    // be a race condition where the first player
    // wants to start the second player before
    // the second player is created.  So, we
    // create them in reverse order.
    var lastFrame = storyFrames.length - 1;
    for(var i = lastFrame; i >= 0; i--) {
      var currentStoryFrame = storyFrames[i];

      var readyCallback = this._determineReadyCallback(i, hasSoundtrack);
      var endPlayBackCallback = this._determineEndPlaybackCallback(i);
      var newFramePlayer = this._createPlayer(currentStoryFrame);
      var playingCallback = this._determinePlayingCallback(i);

      newFramePlayer.create(
        currentStoryFrame,
        readyCallback,
        endPlayBackCallback,
        playingCallback
      );

      this.players.unshift(newFramePlayer);
    }
  };

  storyStateMachine.restartStory = function () {
    var audioStoryPlayer = this.players[AUDIO];
    this._zeroFrameReady.call(audioStoryPlayer);
    var firstStoryPlayer = this.players[FIRST];
    this._firstFrameReady.call(firstStoryPlayer);
  }

  storyStateMachine.endStory = function(){
    closureStoryHasEnded = true;
    var storyPlayers = this.players;
    storyPlayers.forEach(function(player){
      player.destroy();
    });
    storyStateMachine.story = null;
    storyStateMachine.players = [];
    parentControllerScope = null;
  };

  storyStateMachine._createPlayer = function(storyFrame){
    var player = null;
    // TODO: Old story backwards compatibility
    if(storyFrame.mediaType === undefined){
      storyFrame.mediaType = 0;
    }
    // End backwards compatiblity

    switch(storyFrame.mediaType){
      case 0:
        player = new VideoPlayer();
        break;
      case 1:
        player = new ImagePlayer();
        if (storyFrame.narrationText != "") {
          player.textToSpeechPlayer = new TextToSpeechPlayer();
          player.textToSpeechPlayer.createWithSoundOnly(
            storyFrame
          );
        }
        break;
      case 2:
        player = new TextToSpeechPlayer();
        break;
      case 3:
        player = new VideoPlayer();  //Audio only version of VidPlayer
      break;
      default:
        throw "Unrecognized media type in storyStateMachine.js";
        break;
    }

    return player;
  }

  storyStateMachine._determinePlayingCallback = function (frameNum) {
    var playingCallback = function () { };
    var isAudioFrame = frameNum === AUDIO;

    if (isAudioFrame) {
      console.log('isAUDIOFrame determinePlayingCallback conditonal run');
      playingCallback = this._firstFrameReady.bind(storyStateMachine.players[0]);
    }
    return playingCallback;
  }

  storyStateMachine._determineReadyCallback = function (frameNum, hasSoundtrack) {

    var isZeroFrame = frameNum === AUDIO;
    var isFirstFrame = frameNum === FIRST;

    if (hasSoundtrack) {
      if (isZeroFrame) {
        return this._zeroFrameReady;
      } else if (isFirstFrame) {
        return function () { };
      }
    } else {
      if (isFirstFrame) {
        return this._firstFrameReady;
      } else {
        return function () { };
      }
    }
    return function () { };
  };

  storyStateMachine._zeroFrameReady = function(){
    //immediately play soundtrack if exists
    this.play();
  };

  storyStateMachine._firstFrameReady = function(){
    if(closureIsSingleStoryView) {
      _growAct1();
    }
    // Here, *this* will refer to the first frame player
    this.play();
  };

  storyStateMachine._determineEndPlaybackCallback = function(frameNum){
    var endPlayBackCallback = function(){};
    var isFirstFrame  = frameNum === FIRST;
    var isSecondFrame = frameNum === SECOND;
    var isThirdFrame  = frameNum === THIRD;
    var storyStateMachine = this;
    if(isFirstFrame) {
      endPlayBackCallback = function(){
        if(closureIsSingleStoryView) {
          _shrinkAct1AndGrowAct2();
        }

        // Do not attempt to move story
        // forward if it has ended.
        // This is here because these
        // callbacks are asynchronous
        // and could run after endStory()
        if(closureStoryHasEnded) return;

        storyStateMachine.players[SECOND].play();
      };
    } else if(isSecondFrame) {
      endPlayBackCallback = function(){
        if(closureIsSingleStoryView) {
          _shrinkAct2AndGrowAct3();
        }

        // Do not attempt to move story
        // forward if it has ended.
        // This is here because these
        // callbacks are asynchronous
        // and could run after endStory()
        if(closureStoryHasEnded) return;

        storyStateMachine.players[THIRD].play();
      };
    } else if(isThirdFrame) {
      endPlayBackCallback = function(){
        if(closureIsSingleStoryView) {
          _shrinkAct3();
        }

        // Do not attempt to move story
        // forward if it has ended.
        // This is here because these
        // callbacks are asynchronous
        // and could run after endStory()
        if(closureStoryHasEnded) return;

        storyStateMachine.players[AUDIO].pause();
      };
    }

    return endPlayBackCallback;
  };

  function _growAct1() {
    if(_isAngularAlreadyMonitoringDOM()) {
      parentControllerScope.act1divclass = 'growact1';
    } else {
      // Force Angular to re-render
      parentControllerScope.$apply(function () {
        parentControllerScope.act1divclass = 'growact1';
      });
    }
  };

  function _shrinkAct1AndGrowAct2() {
    if(_isAngularAlreadyMonitoringDOM()) {
      parentControllerScope.act1divclass = 'a';
      parentControllerScope.act2divclass = 'growact2';
    } else {
      // Force Angular to re-render
      parentControllerScope.$apply(function () {
        parentControllerScope.act1divclass = 'a';
        parentControllerScope.act2divclass = 'growact2';
      });
    }
  };

  function _shrinkAct2AndGrowAct3() {
    if(_isAngularAlreadyMonitoringDOM()) {
      parentControllerScope.act2divclass = 'a';
      parentControllerScope.act3divclass = 'growact3';
    } else {
      // Force Angular to re-render
      parentControllerScope.$apply(function () {
        parentControllerScope.act2divclass = 'a';
        parentControllerScope.act3divclass = 'growact3';
      });
    }
  };

  function _shrinkAct3() {
    if(_isAngularAlreadyMonitoringDOM()) {
      parentControllerScope.act3divclass = 'a';
      parentControllerScope.replaybutton = 'single-story-replay-button-after';
    } else {
      // Force Angular to re-render
      parentControllerScope.$apply(function () {
        parentControllerScope.act3divclass = 'a';
        parentControllerScope.replaybutton = 'single-story-replay-button-after';
      });
    }
  };

  function _isAngularAlreadyMonitoringDOM() {
    return parentControllerScope.$$phase;
  }

  return storyStateMachine;
});
