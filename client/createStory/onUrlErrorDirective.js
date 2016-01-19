angular.module('storyBoard.onUrlErrorDirective', [])

.directive('onUrlError', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      element.on('error', function(){
        element.attr('src', attr.onUrlError);
      });
    }
  };
});
