'use strict';

angular.module('varroa', [
    'ui.router',
    'angularMoment',
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
      .state('uploads', {
        parent: 'varroa',
        controller: 'UploadsCtrl as uploadsCtrl',
        templateUrl: '/varroa/upload/uploads.html',
        url: '/uploads'
      })
      .state('upload', {
        parent: 'varroa',
        controller: 'UploadCtrl as uploadCtrl',
        templateUrl: '/varroa/upload/upload.html',
        url: '/upload'
      });


    $urlRouterProvider.otherwise('/home');
  });
