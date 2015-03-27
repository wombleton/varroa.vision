'use strict';

angular.module('varroa', [
    'ui.router',
    'varroa.upload'
  ])
  .constant('_', window._)
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('varroa', {
        views: {
          '@': {
            templateUrl: '/varroa/layout/layout.html'
          }
        }
      })
      .state('home', {
        parent: 'varroa',
        templateUrl: '/varroa/home/home.html',
        url: '/home'
      })
      .state('upload', {
        controller: 'UploadCtrl as uploadCtrl',
        templateUrl: '/varroa/upload/upload.html',
        url: '/upload'
      });


    $urlRouterProvider.otherwise('/home');
  });
