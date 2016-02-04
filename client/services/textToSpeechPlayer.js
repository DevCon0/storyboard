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
      var speechBalloon = '<img class="hiddenImagePlayerFrame text-to-speech-image" src="./img/text2speech.gif"/>';
      this.playerDiv.append(speechBalloon);
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
      var text2SpeechDiv = this.playerDiv.children();
      text2SpeechDiv.addClass('showImagePlayerFrame');
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
