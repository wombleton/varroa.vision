/* global angular */
'use strict';

angular
  .module('varroa')
  .directive('varroaHeader', (
    $http
  ) => {
    return {
      restrict: 'E',
      link: (scope) => {
        $http.get('/api/uploads/count')
          .success(({ count } = {}) => {
            scope.count = count;
          });
      },
      templateUrl: '/varroa/layout/header.html'
    };
  });
