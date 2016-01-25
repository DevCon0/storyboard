angular.module('storyBoard.imagePlayer', ['storyBoard.player'])

.factory('ImagePlayer', function(Player){
  function ImagePlayer(){
    this.imageDuration = null;
    this.playerDiv = null;
    this.endPlaybackCallback = null;
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
    var imgTagStr = '<img src=\"' + imageURL + '\" style=\"visibility:hidden;\" height=\"200\" width=\"356\">';
    this.playerDiv.append(imgTagStr);

    readyCallback.call(this);
  };

  ImagePlayer.prototype.destroy = function(){
    this.playerDiv.empty();
  };

  ImagePlayer.prototype.play = function(){
    var imgTag = this.playerDiv.children();
    imgTag.addClass('showImageFrame');
    var durationInMilliseconds = this.imageDuration * 1000;
    var boundEndPlaybackCallback = this.endPlaybackCallback.bind(this);
    setTimeout(function(){
        boundEndPlaybackCallback();
      },
      durationInMilliseconds
    );
  };

  return ImagePlayer;
});
