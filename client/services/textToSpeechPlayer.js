angular.module('storyBoard.textToSpeechPlayer', ['storyBoard.player'])

.factory('TextToSpeechPlayer', function(Player){
  function TextToSpeechPlayer(isBackgroundPlayer){
    this.isBackgroundPlayer = isBackgroundPlayer || false;
    this.playerDiv = null;
    this.utterance = null;
    this.narrationDelay = 0;
  }

  TextToSpeechPlayer.prototype = Object.create(Player.prototype);

  TextToSpeechPlayer.prototype.create = function(storyFrame, readyCallback, endPlaybackCallback){
    this.utterance = new SpeechSynthesisUtterance(storyFrame.narrationText);
    this.utterance.voice = this._getBrowserSupportedVoice();

    this.narrationDelay = storyFrame.narrationDelay || 0;

    this.utterance.onend = endPlaybackCallback;

    if ( ! this.isBackgroundPlayer ) {
      // Add text to DOM
      var divId = '#' + storyFrame.playerDiv;
      this.playerDiv = angular.element(document.querySelector(divId));
      var paragraphTagStr = '<svg class="hiddenImagePlayerFrame text-to-speech-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152.0599975585938 176" enable-background="new 0 0 192 192"><path class="text-to-speech-image-background" d="m76 0c-41.97 0-76 34.03-76 76 0 39.76 36.24 72 76 72v28c46.18-23.42 76.06-61.11 76.06-100 0-41.97-34.09-76-76.06-76" fill="#212121"/><g class="text-to-speech-image-volume" fill="#fafafa"><path class="text-to-speech-image-volume-sound-1" stroke-width="1" d="m84 59.98c5.92 2.94 10 9.04 10 16.1 0 7.06-4.08 13.159-10 16.12v-32.22"/><path class="text-to-speech-image-volume-speaker" d="m76 44.08v64l-20-20h-16v-24h16l20-20"/><path class="text-to-speech-image-volume-sound-2" d="m84 41c16.02 3.64 28 17.94 28 35.08 0 17.14-11.98 31.44-28 35.08v-8.26c11.56-3.44 20-14.14 20-26.82 0-12.68-8.44-23.38-20-26.82v-8.26"/></g></svg>';
      this.playerDiv.append(paragraphTagStr);
    }

    readyCallback.call(this);
  };

  TextToSpeechPlayer.prototype.destroy = function(){
    window.speechSynthesis.cancel();
    if ( ! this.isBackgroundPlayer ) {
      this.playerDiv.empty();
    }
    this.utterance = null;
  };

  TextToSpeechPlayer.prototype.play = function(){
    if (this.narrationDelay) {
      setTimeout(this._play.bind(this), this.narrationDelay * 1000);
    } else {
      this._play();
    }
  };

  TextToSpeechPlayer.prototype._play = function(){
    if ( ! this.isBackgroundPlayer ) {
      var paragraphTagStr = this.playerDiv.children();
      paragraphTagStr.addClass('showImagePlayerFrame');
    }

    window.speechSynthesis.speak(this.utterance);
  };

  TextToSpeechPlayer.prototype._getBrowserSupportedVoice = function(){
    var voicePreferences = [
      'Daniel',
      'Google UK English Male',
      'Google US English'];
    var voice;

    for(var i = 0; i < voicePreferences.length; i++){
      var voicePreference = voicePreferences[i];
      voice = window.voices.filter(function(voice) { return voice.name == voicePreference; })[0];
      if(voice !== undefined){
        break;
      }
    }

    if(voice === undefined){
      // If none of the voices are found in the brower,
      // log this so we know.  The Speech API will fall back
      // to whatever it has, even if that means a German lady.
      console.log("Warning: None of the speech synthesis voice preferences are present in this browser.");
    }

    return voice;
  }

  return TextToSpeechPlayer;
});
