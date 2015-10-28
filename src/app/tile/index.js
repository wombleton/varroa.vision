/* global angular */
'use strict';
angular
	.module('varroa.tile', [])
  .config(($stateProvider) => {
    $stateProvider
      .state('tilevote', {
        parent: 'varroa',
        template: '<tile-vote></tile-vote>',
        url: '/categorise'
      });
  });
