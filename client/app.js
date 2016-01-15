var storyBoardApp = angular.module('storyBoardApp', [
                                   'ui.router',
                                   'storyBoard.auth',
                                   'storyBoard.navBar',
                                   'storyBoard.splash',
                                   'storyBoard.storyStorageService',
                                   'storyBoard.authService',
                                   'LocalStorageModule',
                                   'storyBoard.dashboard',
                                   'storyBoard.createStory'
]);

storyBoardApp.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
      url: "/",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
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
          controller: 'navBarCtrl'
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
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/auth/signup.html',
          controller: 'authCtrl'
        }
      }
    })
    .state('dashboard', {
      url: "/dashboard",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/dashboard/dashboard.html',
          controller: 'dashboardCtrl'
        }
      }
    })
    .state('createStory', {
      url: "/createStory",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/createStory/createStory.html',
          controller: 'createStoryCtrl'
        }
      }
    })


});