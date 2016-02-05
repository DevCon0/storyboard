angular.module('storyBoard.mockYoutubePlayer', [])

.factory('MockYoutubePlayer', function() {
  window.youtubeApiLoadedAndReady = true;

  function MockYoutubePlayer(targetDomElement, playerOptions) {
    // Register the same window constants that Youtube IFrame API does
    window.YT = {
      PlayerState: {
        ENDED: 0,
        PAUSED: 2
      }
    };

    this.mockName = "Mock Youtube Player";
    this.targetDomElement = targetDomElement;
    this.playerOptions = playerOptions;

    this.stateChangeCallback = this.playerOptions.events['onStateChange'];

    this.readyCallback = this.playerOptions.events['onReady'];
    this.readyCallback();
  }

  MockYoutubePlayer.prototype.playVideo = function() {
    // Immediately stop "playing"
    this._simulateEvent(window.YT.PlayerState.PAUSED);
    this._simulateEvent(window.YT.PlayerState.ENDED);
  };

  MockYoutubePlayer.prototype.setVolume = function() {
  };

  MockYoutubePlayer.prototype.cueVideoById = function() {
  };

  MockYoutubePlayer.prototype._simulateEvent = function(eventData) {
    var event = {
      data: eventData
    };
    this.stateChangeCallback(event);
  };

  return MockYoutubePlayer;
});
