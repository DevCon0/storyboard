angular.module('storyBoard.mockYoutubePlayer', [])

.factory('MockYoutubePlayer', function() {
  window.youtubeApiLoadedAndReady = true;
  function MockYoutubePlayer() {
    this.mockName = "Mock Youtube Player";
    this.targetDomElement = null;
    this.playerOptions = null;
    this.readyCallback = null;
  }

  MockYoutubePlayer.prototype.create = function(targetDomElement, playerOptions) {
    this.targetDomElement = targetDomElement;

    this.playerOptions = playerOptions;

    this.readyCallback = this.playerOptions.events['onReady'];
    this.readyCallback();
  }

  MockYoutubePlayer.prototype.play = function() {
  }

  return MockYoutubePlayer;
});
