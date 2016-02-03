angular.module('storyBoard.videoPlayer', ['storyBoard.player'])

.factory('VideoPlayer', function(Player){
  function VideoPlayer(audioId){
    this.storyFrame = null;
    this.endPlaybackCallback = null;
    this.playingCallback = null;
    this.volume = null;
    this.alreadyStopped = false;
    this.audioPlayer = null;
    this.audioDelay = null;

    this.audioId = audioId || '';
    var hasAlternateAudio = this.audioId !== '';
    if (hasAlternateAudio) {
      this.audioPlayer = new VideoPlayer();
    }
  }

  VideoPlayer.prototype = Object.create(Player.prototype);

  VideoPlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback, playingCallback){
    var VIDEO_HEIGHT = 200;
    var VIDEO_WIDTH = 356;
    while( ! window.youtubeApiLoadedAndReady){}

    if (storyFrame.audioId) {
      var frameLength = storyFrame.start + storyFrame.end;
      var audioLength = storyFrame.audioStart + storyFrame.audioEnd;
      if (audioLength > frameLength) {
        storyFrame.audioEnd = storyFrame.audioStart + (storyFrame.end - storyFrame.start)
      }
      var audioStoryFrame = {
        mediaType: 0,
        videoId: storyFrame.audioId,
        volume: storyFrame.audioVolume,
        start: storyFrame.audioStart,
        end: storyFrame.audioEnd,
        playerDiv: storyFrame.playerDiv + 'Audio',
        player: {}
      };

      this.audioPlayer.create(
        audioStoryFrame, readyCallback,
        endPlaybackCallback, playingCallback
      );
    }

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
            'onStateChange': this._onEventListener.bind(this)
          }
        }
      );
    this.storyFrame = storyFrame;
    this.endPlaybackCallback = endPlaybackCallback;
    this.playingCallback = playingCallback;
    this.volume = storyFrame.volume;
    this.audioDelay = storyFrame.audioDelay || 0;
  };

  VideoPlayer.prototype.destroy = function(){
    this.storyFrame.player.destroy();
    if (this.audioPlayer) {
      this.audioPlayer.destroy();
    }
  };

  VideoPlayer.prototype.play = function () {
    var videoPlayer = this;
    setTimeout(function(){
      videoPlayer.alreadyStopped = false;
      if (videoPlayer.audioPlayer) {
        videoPlayer.audioPlayer.play();
      }
      videoPlayer.storyFrame.player.setVolume(parseInt(videoPlayer.volume));
      videoPlayer.storyFrame.player.playVideo();
    }, videoPlayer.audioDelay * 1000);
  };

  VideoPlayer.prototype.pause = function(){
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    this.storyFrame.player.pauseVideo();
  };

  VideoPlayer.prototype._reset = function(){
    this.storyFrame.player.cueVideoById(
      {
        'videoId': this.storyFrame.videoId,
        'startSeconds': this.storyFrame.start,
        'endSeconds': this.storyFrame.end
      }
    );
    if (this.audioPlayer) {
      this.audioPlayer._reset();
    }
  };

  VideoPlayer.prototype._onEventListener = function(event){
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
        case YT.PlayerState.PLAYING:
          console.log('what is this',this.playingCallback);
          this.playingCallback();
          break;

      }
    }
  }

  return VideoPlayer;
});
