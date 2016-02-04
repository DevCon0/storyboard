'use strict';

describe('VideoPlayerTest', function(){
  var newVideoPlayer;
  var testStoryFrame;
  var readyCallback = function(){};
  var endCallback = function(){};
  var playingCallback = function(){};

  beforeEach(module('storyBoard.videoPlayer'));
  beforeEach(module('storyBoard.mockYoutubePlayer'));

  beforeEach(inject(function(VideoPlayer, MockYoutubePlayer){
    newVideoPlayer = new VideoPlayer();
    window.YT = {};
    window.YT.Player = MockYoutubePlayer;
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
    window.YT.Player = null;
    window.YT = null;
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
