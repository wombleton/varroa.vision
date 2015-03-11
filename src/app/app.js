
angular.module('varroa', [
  'ngRoute',
  'varroa.todo'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/varroa/todo/todo.html'
    })
    .otherwise({
      redirectTo: '/todo'
    });
});
