'use strict';

describe('PlayerTest', function(){
  var newVideoPlayer;
  var testStoryFrame;
  var readyCallback = function(){};
  var endCallback = function(){};
  var playingCallback = function(){};

  // Fake Youtube variables
  window.youtubeApiLoadedAndReady = true;
  window.YT = {
    Player: function(){
      this.mockName = "Mock Youtube Player";
    }
  };

  beforeEach(module('storyBoard.videoPlayer'));

  beforeEach(inject(function(VideoPlayer){
    newVideoPlayer = new VideoPlayer();
  }));

  beforeEach(function(){
    testStoryFrame = {
      mediaType: 0,
      player: null,
      playerDiv: 'player1',
      videoId: 'S7_Hr3iCPls',
      start: 0,
      end: 0,
      volume: 100,
      previewUrl: null,
      imageUrl: null,
      imageDuration: 0,
      audioId: null,
      audioStart: 0,
      audioVolume: 0,
      narrationText: null,
      narrationDelay: 0
    };
  });

  afterEach(inject(function(){
    newVideoPlayer = null;
  }));

  it('should have a create method', function(){
    expect(typeof newVideoPlayer.create).toBe('function');
  });

  it('should have a play method', function(){
    expect(typeof newVideoPlayer.play).toBe('function');
  });

  it('should have a destroy method', function(){
    expect(typeof newVideoPlayer.destroy).toBe('function');
  });

  it('should create a Youtube player', function(){
    newVideoPlayer.create(
        testStoryFrame,
        readyCallback,
        endCallback,
        playingCallback);
    expect(testStoryFrame.player).not.toBeNull();
  });
});
