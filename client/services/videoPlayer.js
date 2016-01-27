angular.module('storyBoard.videoPlayer', ['storyBoard.player'])

.factory('VideoPlayer', function(Player){
  function VideoPlayer(){
    this.storyFrame = null;
    this.endPlaybackCallback = null;
    this.volume = null;
    this.alreadyStopped = false;
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
    this.volume = storyFrame.volume;
  };

  VideoPlayer.prototype.destroy = function(){
    this.storyFrame.player.destroy();
  };

  VideoPlayer.prototype.play = function(){
    this.storyFrame.player.setVolume(this.volume);
    this.storyFrame.player.playVideo();
  };

  VideoPlayer.prototype.pause = function(){
    this.storyFrame.player.pauseVideo();
  };

  VideoPlayer.prototype._reset = function(){
    this.alreadyStopped = false;
    this.storyFrame.player.cueVideoById(
      {
        'videoId': this.storyFrame.videoId,
        'startSeconds': this.storyFrame.start,
        'endSeconds': this.storyFrame.end
      }
    );
  };

  VideoPlayer.prototype._onPausedListener = function(event){
    if( ! this.alreadyStopped) {
      switch(event.data) {
        case YT.PlayerState.PAUSED:
        case YT.PlayerState.ENDED:
          this.endPlaybackCallback();
          this._reset();
          // Use the following boolean to cover
          // the case where a video *pauses*
          // and then *ends*.
          // We do not want to call the callback
          // twice.
          this.alreadyStopped = true;
          break;
      }
    }
  }

  return VideoPlayer;
});
