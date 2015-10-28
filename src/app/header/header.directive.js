/* global angular */
'use strict';

angular
  .module('varroa')
  .directive('varroaHeader', () => {
    return {
      restrict: 'E',
      templateUrl: '/varroa/layout/header.html'
    };
  });
