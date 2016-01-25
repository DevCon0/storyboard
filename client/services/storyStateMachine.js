angular.module('storyBoard.storyStateMachineService',
  ['storyBoard.videoPlayer',
   'storyBoard.imagePlayer'])

.factory('StoryStateMachine', function(VideoPlayer, ImagePlayer){
  var storyStateMachine = {};
  storyStateMachine.story = null;
  var closureIsSingleStoryView = false;
  storyStateMachine.players = [];
  var parentControllerScope = null;
  var AUDIO = 0;
  var FIRST = 1;
  var SECOND = 2;
  var THIRD = 3;

  storyStateMachine.setStory = function(story, isSingleStoryView, scope){
    this.story = story;
    closureIsSingleStoryView = isSingleStoryView;
    parentControllerScope = scope;
    var storyFrames = story.frames;
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
      var readyCallback = this._determineReadyCallback(i);
      var endPlayBackCallback = this._determineEndPlaybackCallback(i);
      var newFramePlayer = this._createPlayer(currentStoryFrame.mediaType);
      newFramePlayer.create(
        currentStoryFrame,
        readyCallback,
        endPlayBackCallback);
      this.players.unshift(newFramePlayer);
    }
  };

  storyStateMachine.endStory = function(){
    var storyPlayers = this.players;
    storyPlayers.forEach(function(player){
      player.destroy();
    });
    storyStateMachine.story = null;
    storyStateMachine.players = [];
    parentControllerScope = null;
  };

  storyStateMachine._createPlayer = function(mediaType){
    var player = null;
    // TODO: Old story backwards compatibility
    if(mediaType === undefined){
      mediaType = 0;
    }
    // End backwards compatiblity

    switch(mediaType){
      case 0:
        player = new VideoPlayer();
        break;
      case 1:
        player = new ImagePlayer();
        break;
      default:
        throw "Unrecognized media type in storyStateMachine.js";
        break;
    }

    return player;
  }

  storyStateMachine._determineReadyCallback = function(frameNum){
    var readyCallback = function(){};
    var isFirstFrame = frameNum === FIRST;
    if(isFirstFrame){
      readyCallback = this._firstFrameReady;
    }

    return readyCallback;
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
        storyStateMachine.players[SECOND].play();
      };
    } else if(isSecondFrame) {
      endPlayBackCallback = function(){
        if(closureIsSingleStoryView) {
          _shrinkAct2AndGrowAct3();
        }
        storyStateMachine.players[THIRD].play();
      };
    } else if(isThirdFrame) {
      endPlayBackCallback = function(){
        if(closureIsSingleStoryView) {
          _shrinkAct3();
        }
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
    } else {
      // Force Angular to re-render
      parentControllerScope.$apply(function () {
        parentControllerScope.act3divclass = 'a';
      });
    }
  };

  function _isAngularAlreadyMonitoringDOM() {
    return parentControllerScope.$$phase;
  }

  return storyStateMachine;
});
