angular.module('storyBoard.videoPlayer', ['storyBoard.player'])

.factory('VideoPlayer', function(Player){
  function VideoPlayer(){
    this.storyFrame = null;
    this.endPlaybackCallback = null;
  }

  VideoPlayer.prototype = Object.create(Player.prototype);

  VideoPlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback){
    var VIDEO_HEIGHT = 200;
    var VIDEO_WIDTH = 356;
    while( ! window.youtubeApiLoadedAndReady){}
    storyFrame.player =
      new YT.Player(
        storyFrame.playerDiv,
        {
          height: VIDEO_HEIGHT,
          width: VIDEO_WIDTH,
          videoId: storyFrame.videoId,
          playerVars: {
            controls: 0,
            showinfo: 0,
            start: storyFrame.start,
            end: storyFrame.end
          },
          events: {
            'onReady': readyCallback.bind(this),
            'onStateChange': this._onPausedListener.bind(this)
          }
        }
      );
    this.storyFrame = storyFrame;
    this.endPlaybackCallback = endPlaybackCallback;
  };

  VideoPlayer.prototype.destroy = function(){
    this.storyFrame.player.destroy();
  };

  VideoPlayer.prototype.play = function(){
    this.storyFrame.player.playVideo();
  };

  VideoPlayer.prototype._reset = function(){
    this.storyFrame.player.cueVideoById(
      {
        'videoId': this.storyFrame.videoId,
        'startSeconds': this.storyFrame.start,
        'endSeconds': this.storyFrame.end
      }
    );
  };

  VideoPlayer.prototype._onPausedListener = function(event){
    switch(event.data){
      case YT.PlayerState.PAUSED:
        this.endPlaybackCallback();
        this._reset();
        break;
    }
  }

  return VideoPlayer;
});
