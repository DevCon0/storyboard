angular.module('storyBoard.videoPlayer', ['storyBoard.player'])

.factory('VideoPlayer', function(Player){
  function VideoPlayer(audioId){
    this.storyFrame = null;
    this.endPlaybackCallback = null;
    this.playingCallback = null;
    this.volume = null;
    this.alreadyStopped = false;
    this.audioPlayer = null;

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

    if (this.audioId) {
      var dummyEndPlaybackCallback = function() {};
      this._createAudioPlayer(
        storyFrame, readyCallback, dummyEndPlaybackCallback, playingCallback
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
  };

  VideoPlayer.prototype._createAudioPlayer = function(storyFrame, readyCallback, endPlaybackCallback, playingCallback){
    storyFrame.audioEnd = storyFrame.audioStart + (storyFrame.end - storyFrame.start);
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
  };

  VideoPlayer.prototype.destroy = function(){
    this.storyFrame.player.destroy();
    if (this.audioPlayer) {
      this.audioPlayer.destroy();
    }
  };

  VideoPlayer.prototype.play = function () {
    this.alreadyStopped = false;
    if (this.audioPlayer) {
      this.audioPlayer.play();
    }
    this.storyFrame.player.setVolume(parseInt(this.volume));
    this.storyFrame.player.playVideo();
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

  VideoPlayer.prototype._onEventListener = function (event) {
    if ( ! this.alreadyStopped) {
      switch (event.data) {
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
          console.log('what is this', this.playingCallback);
          this.playingCallback();
          break;

      }
    }
  };

  return VideoPlayer;
});
