angular.module('storyBoard.textToSpeechPlayer', ['storyBoard.player'])

.factory('TextToSpeechPlayer', function(Player){
  function TextToSpeechPlayer(){
    this.playerDiv = null;
    this.utterance = null;
  }

  TextToSpeechPlayer.prototype = Object.create(Player.prototype);

  TextToSpeechPlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback){
    this.utterance = new SpeechSynthesisUtterance(storyFrame.narrationText);
    this.utterance.onend = endPlaybackCallback;
    this.utterance.voice = window.voices.filter(function(voice) { return voice.name == 'Daniel'; })[0];

    // Add text to DOM
    var divId = '#' + storyFrame.playerDiv;
    this.playerDiv = angular.element(document.querySelector(divId));
    var paragraphTagStr = '<div style="height: 200px; width: 356px; display: inline-block;"><p>' + storyFrame.narrationText + '</p></div>';
    this.playerDiv.append(paragraphTagStr);

    readyCallback.call(this);
  };

  TextToSpeechPlayer.prototype.destroy = function(){
    window.speechSynthesis.cancel();
    this.playerDiv.empty();
    this.utterance = null;
  };

  TextToSpeechPlayer.prototype.play = function(){
    window.speechSynthesis.speak(this.utterance);
  };

  return TextToSpeechPlayer;
});
