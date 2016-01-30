angular.module('storyBoard.imagePlayer', ['storyBoard.player'])

.factory('ImagePlayer', function(Player){
  function ImagePlayer(){
    this.imageDuration = null;
    this.playerDiv = null;
    this.endPlaybackCallback = null;
  }

  ImagePlayer.prototype = Object.create(Player.prototype);

  ImagePlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback){
    console.log('Creating image for storyFrame:', storyFrame);
    // Save image duration and end playback callback for later
    this.imageDuration = storyFrame.imageDuration;
    this.endPlaybackCallback = endPlaybackCallback;

    // Add image to DOM
    var divId = '#' + storyFrame.playerDiv;
    this.playerDiv = angular.element(document.querySelector(divId));
    var imageURL = storyFrame.imageUrl;
    var imgTagStr = '<img src=\"' + imageURL + '\" class=\"hiddenImagePlayerFrame\">';
    this.playerDiv.append(imgTagStr);

    readyCallback.call(this);
  };

  // This doesn't seem to ever get called.
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
