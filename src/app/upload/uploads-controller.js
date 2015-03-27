'use strict';

angular
  .module('varroa.upload')
  .controller('UploadsCtrl', function ($http) {
    const vm = this;

    vm.uploads = [];

    $http.get('/api/uploads')
      .success((data) => {
        vm.uploads = data;
      });
  });
