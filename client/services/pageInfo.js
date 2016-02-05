angular.module('storyBoard.pageInfo', [])

.factory('PageInfo', function() {
  var pageInfo = {
    'title': ''
  };
  return {
    get: function(key) {
      return (key !== undefined) ? pageInfo[key] : pageInfo;
    },
    set: function(newPageInfo) {
      pageInfo.title = newPageInfo.title;
    }
  };
});
