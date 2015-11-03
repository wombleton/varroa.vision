/* global angular */
'use strict';

angular
  .module('varroa', [
    'ui.router',
    'infinite-scroll',
    'angularMoment',
    'varroa.upload',
    'varroa.tile',
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
      });

    $urlRouterProvider.otherwise('/');
  });
