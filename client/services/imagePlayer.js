angular.module('storyBoard.imagePlayer', ['storyBoard.player', 'storyBoard.textToSpeechPlayer'])

.factory('ImagePlayer', function(Player, TextToSpeechPlayer){
  function ImagePlayer(narrationText){
    this.imageDuration = null;
    this.playerDiv = null;
    this.endPlaybackCallback = null;
    this.textToSpeechPlayer = null;

    this.narrationText = narrationText || '';
    var containsNarrationText = this.narrationText !== '';
    if (containsNarrationText) {
      var isBackgroundPlayer = true;
      this.textToSpeechPlayer = new TextToSpeechPlayer(isBackgroundPlayer);
    }
  }

  ImagePlayer.prototype = Object.create(Player.prototype);

  ImagePlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback) {
    // Save image duration and end playback callback for later
    this.imageDuration = storyFrame.imageDuration;
    this.endPlaybackCallback = endPlaybackCallback;

    // Add image to DOM
    var divId = '#' + storyFrame.playerDiv;
    this.playerDiv = angular.element(document.querySelector(divId));
    var imageURL = storyFrame.imageUrl;
    var imgTagStr = '<img src=\"' + imageURL + '\" class=\"hiddenImagePlayerFrame\">';
    this.playerDiv.append(imgTagStr);

    if (this.textToSpeechPlayer) {
      var dummyReadyCallback = function() {};
      var dummyEndPlaybackCallback = function() {};
      this.textToSpeechPlayer.create(
        storyFrame, dummyReadyCallback, dummyEndPlaybackCallback
      );
    }

    readyCallback.call(this);
  };

  ImagePlayer.prototype.destroy = function(){
    if (this.textToSpeechPlayer) {
      this.textToSpeechPlayer.destroy();
    }
    this.playerDiv.empty();
  };

  ImagePlayer.prototype.play = function(){
    var imgTag = this.playerDiv.children();
    imgTag.addClass('showImagePlayerFrame');
    var durationInMilliseconds = this.imageDuration * 1000;
    var boundEndPlaybackCallback = this.endPlaybackCallback.bind(this);

    if (this.textToSpeechPlayer) {
      this.textToSpeechPlayer.play();
    }

    setTimeout(function(){
      boundEndPlaybackCallback();
    }, durationInMilliseconds);
  };

  return ImagePlayer;
});
