'use strict';

describe('StoryStateMachineTest', function(){

  var storyStateMachine;
  var originalVideoPlayer;

  beforeEach(module('storyBoard.storyStateMachineService'));

  it('should have a set story method', function(){
    inject(function(StoryStateMachine) {
      expect(typeof StoryStateMachine.setStory).toBe('function');
    });
  });


  it('should create the right players for a story', function(){
    var dummyCreate = function(){};
    var mockVideoPlayer = function(){
      this.name = "video";
      this.create = dummyCreate;
    };
    var mockImagePlayer = function(){
      this.name = "image";
      this.create = dummyCreate;
    };
    var mockTextToSpeechPlayer = function(){
      this.name = "textToSpeech";
      this.create = dummyCreate;
    };

    var mockStory = {
      frames: [
        {
          mediaType: 0 //video
        },
        {
          mediaType: 1 //image
        },
        {
          mediaType: 0 //video
        },
        {
          mediaType: 2 //text to speech
        }
      ]
    }

    module(function($provide) {
      $provide.value('VideoPlayer', mockVideoPlayer);
      $provide.value('ImagePlayer', mockImagePlayer);
      $provide.value('TextToSpeechPlayer', mockTextToSpeechPlayer);
    });

    inject(function(StoryStateMachine) {
      StoryStateMachine.setStory(mockStory);
      // Spot check that the ImagePlayer was created for
      // the frame with mediaType image.
      var player1stFrameIndex = 1;
      var player1stFrameName = StoryStateMachine.players[player1stFrameIndex].name;
      expect(player1stFrameName).toBe('image');
    });
  });
});

