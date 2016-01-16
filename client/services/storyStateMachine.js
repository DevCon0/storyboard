angular.module('storyBoard.storyStateMachineService', [])

.factory('StoryStateMachine', function($window){
  var storyStateMachine = {};

  storyStateMachine.setStory = function(story){
    this.story = story;
    while( ! window.youtubeApiLoadedAndReady){}
    var VIDEO_HEIGHT = 200;
    var VIDEO_WIDTH = 356;
    var storyFrames = story.frames;
    for(var i = 0; i < storyFrames.length; i++){
      storyFrames[i].player =
        new YT.Player(
          storyFrames[i].playerDiv,
          {
            height: VIDEO_HEIGHT,
            width: VIDEO_WIDTH,
            videoId: storyFrames[i].videoId,
            playerVars: {
              controls: 0,
              showinfo: 0,
              start: storyFrames[i].start,
              end: storyFrames[i].end
            },
            events: {
              'onReady': storyStateMachine.onPlayerReady.bind(storyStateMachine),
              'onStateChange': storyStateMachine.playerStateListener.bind(storyStateMachine)
            }
          }
        );
    }
  };

  storyStateMachine.playerStateListener = function(event){
    var state = null;
    switch(event.data){
      case -1:
        state = 'unstarted';
        break;
      case YT.PlayerState.ENDED:
        state = 'ended';
        break;
      case YT.PlayerState.PLAYING:
        state = 'playing';
        break;
      case YT.PlayerState.PAUSED:
        state = 'paused';
        this.playNextVideo(event);
        this.recueCurrentVideo(event);
        break;
      case YT.PlayerState.BUFFERING:
        state = 'buffering';
        break;
      case YT.PlayerState.CUED:
        state = 'cued';
        break;
    }
    var playerDivId = event.target.f.id;
    console.log(playerDivId);
    console.log('Current url: ' + event.target.B.videoUrl);
    console.log('Current State: ' + state);
  };

  storyStateMachine.playNextVideo = function(event){
    var pausedPlayerDivId = event.target.f.id;
    switch(pausedPlayerDivId){
      case 'player1':
        this.story.frames[this.story.FRAME2].player.playVideo();
        break;
      case 'player2':
        this.story.frames[this.story.FRAME3].player.playVideo();
        break;
      case 'player3':
        break;
    }
  };

  storyStateMachine.recueCurrentVideo = function(event){
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
  };

  storyStateMachine.onPlayerReady = function(event){
    var readyPlayer = event.target;
    var readyPlayerDivId = event.target.f.id;
    switch(readyPlayerDivId){
      case 'player1':
        readyPlayer.playVideo();
        break;
      case 'player2':
      case 'player3':
        readyPlayer.playVideo();
        readyPlayer.pauseVideo();
        break;
    }
  };

  return storyStateMachine;
})







