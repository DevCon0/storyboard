angular.module('storyBoard.imagePlayer', ['storyBoard.player', 'storyBoard.textToSpeechPlayer'])

.factory('ImagePlayer', function(Player, TextToSpeechPlayer){
  function ImagePlayer(narrationText){
    this.imageDuration = null;
    this.playerDiv = null;
    this.endPlaybackCallback = null;

    this.narrationText = narrationText || '';
    this.textToSpeechPlayer = null;
  }

  ImagePlayer.prototype = Object.create(Player.prototype);

  ImagePlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback){
    // Save image duration and end playback callback for later
    this.imageDuration = storyFrame.imageDuration;
    this.endPlaybackCallback = endPlaybackCallback;

    // Add image to DOM
    var divId = '#' + storyFrame.playerDiv;
    this.playerDiv = angular.element(document.querySelector(divId));
    var imageURL = storyFrame.imageUrl;
    var imgTagStr = '<img src=\"' + imageURL + '\" class=\"hiddenImagePlayerFrame\">';
    this.playerDiv.append(imgTagStr);

    if (this.narrationText != "") {
      this.textToSpeechPlayer = new TextToSpeechPlayer(true);
      this.textToSpeechPlayer.create(storyFrame);
    }

    readyCallback.call(this);
  };

  ImagePlayer.prototype.destroy = function(){
    this.playerDiv.empty();
  };

  ImagePlayer.prototype.play = function(){
    var imgTag = this.playerDiv.children();
    imgTag.addClass('showImagePlayerFrame');
    var durationInMilliseconds = this.imageDuration * 1000;
    var boundEndPlaybackCallback = this.endPlaybackCallback.bind(this);

    var textToSpeechPlayer = this.textToSpeechPlayer;
    if (textToSpeechPlayer) {
      textToSpeechPlayer.play();
    }

    setTimeout(function(){
      if (textToSpeechPlayer) {
        textToSpeechPlayer.destroy();
      }
      boundEndPlaybackCallback();
    }, durationInMilliseconds);
  };

  return ImagePlayer;
});
