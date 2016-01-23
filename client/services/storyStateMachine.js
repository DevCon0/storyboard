angular.module('storyBoard.storyStateMachineService', ['storyBoard.videoPlayer'])

.factory('StoryStateMachine', function(VideoPlayer){
  var storyStateMachine = {};
  storyStateMachine.story = null;
  var closureIsSingleStoryView = false;
  storyStateMachine.players = [];
  var parentControllerScope = null;
  var FIRST = 0;
  var SECOND = 1;
  var THIRD = 2;

  storyStateMachine.setStory = function(story, isSingleStoryView, scope){
    this.story = story;
    closureIsSingleStoryView = isSingleStoryView;
    parentControllerScope = scope;
    var storyFrames = story.frames;
    var lastFrame = storyFrames.length - 1;
    for(var i = lastFrame; i >= 0; i--) {
      var currentStoryFrame = storyFrames[i];
      var readyCallback = this._determineReadyCallback(i);
      var endPlayBackCallback = this._determineEndPlaybackCallback(i);
      var newFramePlayer = new VideoPlayer();
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
    parentControllerScope.$apply(function () {
      parentControllerScope.act1divclass = 'growact1';
    });
  };

  function _shrinkAct1AndGrowAct2() {
    parentControllerScope.$apply(function () {
      parentControllerScope.act1divclass = 'a';
      parentControllerScope.act2divclass = 'growact2';
    });
  };

  function _shrinkAct2AndGrowAct3() {
    parentControllerScope.$apply(function () {
      parentControllerScope.act2divclass = 'a';
      parentControllerScope.act3divclass = 'growact3';
    });
  };

  function _shrinkAct3() {
    parentControllerScope.$apply(function () {
      parentControllerScope.act3divclass = 'a';
    });
  };

  return storyStateMachine;
});
