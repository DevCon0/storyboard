var storyBoardApp = angular.module('storyBoardApp', [
                                   'ui.router',
                                   'storyBoard.auth',
                                   'storyBoard.navBar',
                                   'storyBoard.splash',
                                   'storyBoard.storyStorageService',
                                   'storyBoard.authService',
                                   'LocalStorageModule'
]);

storyBoardApp.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
      url: "/",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
        },
        'content': {
          templateUrl: '/splash/splash.html',
          controller: 'splashCtrl'
        }
      }
       })
    .state('signin', {
      url: "/signin",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
        },
        'content': {
          templateUrl: '/auth/signin.html',
          controller: 'authCtrl'
        }
      }
    })
    .state('signup', {
      url: "/signup",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
        },
        'content': {
          templateUrl: '/auth/signup.html',
          controller: 'authCtrl'
        }
      }
    })
});