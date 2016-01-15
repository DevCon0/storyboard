angular.module('storyBoard.storyStorageService', [])

.factory('StoryStorage', function ($http, $rootScope, $location, $window) {
  var storyStorage = {};

  storyStorage.getTopThree = function () {
    console.log('Get Top Three Stories Run!');
    //write logic to retrive 3 stories



    // Won't that be fun
    return [
      {
        url: 'http://www.comicbookreligion.com/img/h/u/Huey_Duck.jpg',
        title: 'Huey Duck',
        creator:'David Milco',
        rating: 5,
        text:'A brief history of Huey the Duck.'
      },
      {url:'http://www.comicbookreligion.com/img/d/e/Dewey_Duck.jpg',
        title:'Dewey Duck',
        creator: 'Dan Gorby',
        rating: 4,
        text: 'A very insightful look at the life of Dewey the Duck.'
      },
      {url:'http://www.comicbookreligion.com/img/l/o/Louie_Duck.jpg',
        title:'Louie Duck',
        creator: 'Donald Duck',
        rating: 1,
        text: "Quack, Quack, Quack, Quack, Quack, Quack, Quack, Quack, Quack, Quack, Quack, Quack"
      }
      //{url: 'http://vignette2.wikia.nocookie.net/kingdomheartsfanon/images/3/31/13_Webby_Vanderquack.jpg/revision/latest?cb=20130915214600',
      // title: 'Webby',
      //  creator: 'Clap Trap',
      //  rating: 3,
      //  text: "Best of the bunch, seriously!!!"
      //}
    ]

  }

  storyStorage.getUserLibrary = function (username) {
    console.log('getUserLibrary called with', username);
    return $http({
      method: 'GET',
      url: '/library/username',
      data: userid
    })
     .then(function (resp) {
       console.log('ran getUserLibrary, got response: ', resp);
     });
  };

  storyStorage.getStory = function (id) {
    //TODO - Remove when you want to go to the server.
    var testing = true;
    if(testing){
      var story = {
        FRAME1: 0,
        FRAME2: 1,
        FRAME3: 2,
        frames: [
          {
            player: null,
            playerDiv: 'player1',
            videoId: '8lXdyD2Yzls',
            start: 0,
            end: 2
          },
          {
            player: null,
            playerDiv: 'player2',
            videoId: '3GJOVPjhXMY',
            start: 9,
            end: 14
          },
          {
            player: null,
            playerDiv: 'player3',
            videoId: '-5x5OXfe9KY',
            start: 3,
            end: 7
          }
        ]
      }

      return story;
    } else {
      console.log('getStory called with', id);
      return $http({
        method: 'GET',
        url: '/story',
        data: id
      })
       .then(function (resp) {
         console.log('ran getStory, got response: ', resp);
       });
    }
  };

  return storyStorage;
})