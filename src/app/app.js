/* global angular */
'use strict';

angular.module('varroa', [
    'ui.router',
    'angularMoment',
    'varroa.upload',
    'angulartics.google.analytics'
  ])
  .constant('_', window._)
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('varroa', {
        views: {
          '@': {
            templateUrl: '/varroa/layout/layout.html'
          },
          'header@': {
            template: '<varroa-header></varroa-header>'
          }
        }
      })
      .state('home', {
        parent: 'varroa',
        templateUrl: '/varroa/home/home.html',
        url: '/'
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
        url: '/add'
      });

    $urlRouterProvider.otherwise('/');
  });
