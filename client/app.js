var storyBoardApp = angular.module('storyBoardApp', [
                                   'ui.router',
                                   'ng-polymer-elements',
                                   'LocalStorageModule',
                                   'storyBoard.auth',
                                   'storyBoard.navBar',
                                   'storyBoard.splash',
                                   'storyBoard.singleStory',
                                   'storyBoard.dashboard',
                                   'storyBoard.onUrlErrorDirective',
                                   'storyBoard.createStory',
                                   'storyBoard.player',
                                   'storyBoard.videoPlayer',
                                   'storyBoard.storyStateMachineService',
                                   'storyBoard.storyStorageService',
                                   'storyBoard.authService',
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
    .state('login', {
      url: "/login",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/auth/login.html',
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
    .state('singleStory', {
      url: '/singleStory/{storyId}',
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/singleStory/singleStory.html',
          controller: 'singleStoryCtrl'
        }
      }
    })
    .state('createStory', {
      params: {
        story: {}
      },
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
    });
});

