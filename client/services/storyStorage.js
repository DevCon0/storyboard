angular.module('storyBoard.storyStorageService', [])

.factory('StoryStorage', function ($http, $rootScope, $location, $window) {
  var storyStorage = {};

  storyStorage.getTopThree = function () {
    console.log('Get Top Three Stories Run!');
    //write logic to retrive 3 stories



    // Won't that be fun
    return [
      {
        url: 'http://images6.fanpop.com/image/photos/37600000/Huey-Duck-mickey-and-friends-37665348-260-388.gif',
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
       text: "Quack,Quack,Quack,Quack,Quack,Quack,Quack,Quack,Quack,Quack,Quack,Quack"
      }
    ]

  }

  return storyStorage;
})