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

    this.utterance.voice = this._getBrowserSupportedVoice();

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
