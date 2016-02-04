angular.module('storyBoard.storyStateMachineService',
  ['storyBoard.videoPlayer',
   'storyBoard.imagePlayer',
   'storyBoard.textToSpeechPlayer'])

.factory('StoryStateMachine', function(VideoPlayer, ImagePlayer, TextToSpeechPlayer){
  var storyStateMachine = {
    story: null,
    players: [],
    storyRestartCallback: null
  };

  var closureIsSingleStoryView = false;
  var closureStoryHasEnded = false;
  var parentControllerScope = null;

  var AUDIO = 0;
  var FIRST = 1;
  var SECOND = 2;
  var THIRD = 3;

  storyStateMachine.setStory = function(story, isSingleStoryView, scope){
    this.story = story;
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

      var newFramePlayer = this._createPlayer(currentStoryFrame);
      var readyCallback = this._determineReadyCallback(
                            i,
                            newFramePlayer,
                            hasSoundtrack);
      var endPlayBackCallback = this._determineEndPlaybackCallback(i);
      var playingCallback = this._determinePlayingCallback(i);

      newFramePlayer.create(
        currentStoryFrame,
        readyCallback,
        endPlayBackCallback,
        playingCallback
      );
  
      this.players.unshift(newFramePlayer);
    }

    this._registerNavigateAwayListener();
  };

  storyStateMachine._registerNavigateAwayListener = function () {
    var originalURL = document.URL;

    var checkingIfNavigatedAway = setInterval(function() {
      var haveNavigatedAway = (document.URL !== originalURL);
      if (haveNavigatedAway) {
        this.endStory();
        clearInterval(checkingIfNavigatedAway);
      }
    }.bind(this), 100);
  };

  storyStateMachine.restartStory = function () {
    this.storyRestartCallback();
  }

  storyStateMachine.endStory = function(){
    closureStoryHasEnded = true;
    var storyPlayers = this.players;
    storyPlayers.forEach(function(player){
      player.destroy();
    });

    // Reset storyStateMachine obj properties
    this.story = null;
    this.players = [];
    this.storyRestartCallback = null;

    // Reset storyStateMachine closure variables
    closureIsSingleStoryView = false;
    closureStoryHasEnded = false;
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
        player = new VideoPlayer(storyFrame.audioId);
        break;
      case 1:
        player = new ImagePlayer(storyFrame.narrationText);
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

  storyStateMachine._determineReadyCallback = function (currentFrameNum, currentPlayer, hasSoundtrack) {

    var isZeroFrame = currentFrameNum === AUDIO;
    var isFirstFrame = currentFrameNum === FIRST;

    if (hasSoundtrack) {
      if (isZeroFrame) {
        this.storyRestartCallback = this._zeroFrameReady.bind(currentPlayer);
        return this._zeroFrameReady;
      } else if (isFirstFrame) {
        return function () { };
      }
    } else {
      if (isFirstFrame) {
        this.storyRestartCallback = this._firstFrameReady.bind(currentPlayer);
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
    if (closureIsSingleStoryView) {
      parentControllerScope.isFirstFrameLoaded = true;
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
