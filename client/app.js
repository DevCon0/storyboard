var storyBoardApp = angular.module('storyBoardApp', [
                                   'ui.router',

]);

storyBoardApp.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/signin");

  $stateProvider
    .state('signin', {
      url: "/signin",
      templateUrl: "auth/signin.html"
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "auth/signup.html"
    })
});