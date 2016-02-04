angular.module('storyBoard.mockYoutubePlayer', [])

.factory('MockYoutubePlayer', function() {
  window.youtubeApiLoadedAndReady = true;

  function MockYoutubePlayer(targetDomElement, playerOptions) {
    this.mockName = "Mock Youtube Player";
    this.targetDomElement = targetDomElement;
    this.playerOptions = playerOptions;

    this.stateChangeCallback = this.playerOptions.events['onStateChange'];

    this.readyCallback = this.playerOptions.events['onReady'];
    this.readyCallback();
  }

  MockYoutubePlayer.prototype.playVideo = function() {
    window.YT = {
      PlayerState: {
        ENDED: 0,
        PAUSED: 2
      }
    };

    var event = {
      data: window.YT.PlayerState.PAUSED
    };
    this.stateChangeCallback(event);

    event.data = window.YT.PlayerState.ENDED;
    this.stateChangeCallback(event);
  }

  MockYoutubePlayer.prototype.setVolume = function() {
  }

  MockYoutubePlayer.prototype.cueVideoById = function() {
  }

  return MockYoutubePlayer;
});
