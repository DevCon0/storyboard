var storyBoardApp = angular.module('storyBoardApp', [
                                   'ui.router',
                                   'LocalStorageModule',
                                   'storyBoard.auth',
                                   'storyBoard.navBar',
                                   'storyBoard.splash',
                                   'storyBoard.singleStory',
                                   'storyBoard.dashboard',
                                   'storyBoard.onUrlErrorDirective',
                                   'storyBoard.createStory',
                                   'storyBoard.profile',
                                   'storyBoard.userServices',
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
    .state('singleStory', {
      url: '/singleStory',
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
    .state('profile', {
      url: "/profile",
      views: {
        'navBar': {
          templateUrl: '/navBar/navBar.html',
          controller: 'navBarCtrl'
        },
        'content': {
          templateUrl: '/profile/profile.html',
          controller: 'profileCtrl'
        }
      }
    })
});

