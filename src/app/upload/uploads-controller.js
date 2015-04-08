'use strict';

angular
  .module('varroa.upload')
  .controller('UploadsCtrl', function ($http) {
    const vm = this;

    vm.uploads = [];

    $http.get('/api/uploads')
      .success((data) => {
        vm.uploads = data;
        if (vm.uploads.length) {
          vm.select(0);
        }
      });

    const setSelected = () => {
      if (vm.index > vm.uploads.length - 1) {
        vm.index = 0;
      }
      if (vm.index < 0) {
        vm.index = vm.uploads.length - 1;
      }
      vm.selected = vm.uploads[vm.index];
    };

    vm.next = () => {
      vm.index++;
      setSelected();
    };

    vm.prev = () => {
      vm.index--;
      setSelected();
    };

    vm.select = function($index) {
      vm.index = $index;
      setSelected();
    };

  });
