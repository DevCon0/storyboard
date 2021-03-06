'use strict';

describe('CreateStoryTest', function(){
  var createControllerFunction;
  var scope;
  var stateParams;
  var controller;
  var loadController = function(test) {
    var mockAuth = {
      isAuth: function() { return true;}
    };

    module(function($provide) {
      $provide.value('Auth', mockAuth);
    });

    inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      stateParams = {
        story: {}
      };

      controller = $controller('createStoryCtrl', {
          '$scope': scope,
          '$stateParams': stateParams
      });

      test();
    });
  };

  beforeEach(module('storyBoard.storyStorageService'));
  beforeEach(module('storyBoard.storyStateMachineService'));
  // We will mock the following dependency:
  // beforeEach(module('storyBoard.authService'));
  beforeEach(module('storyBoard.pageInfo'));
  beforeEach(module('LocalStorageModule'));
  beforeEach(module('ui.router'));
  beforeEach(module('storyBoard.createStory'));

  it('should have a function called checkRequiredFields', function() {
    loadController(function(){
      expect(typeof scope.checkRequiredFields).toBe('function');
    });
  });

});
