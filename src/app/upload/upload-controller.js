'use strict';

angular
  .module('varroa.upload')
  .controller('UploadCtrl', function ($upload) {
    const vm = this;

    vm.files = [];

    vm.submit = () => {
      vm.error = vm.success = undefined;
      vm.inProgress = true;
      $upload
        .upload({
          url: '/api/upload',
          file: vm.files,
          fields: {
            name: vm.name
          }
        })
        .progress((e) => {
          const { loaded, total } = e;
          vm.progress = parseInt(100.0 * loaded / total);
        })
        .success(() => {
          vm.success = true;
          vm.inProgress = false;
          vm.files = [];
        })
        .error((e) => {
          vm.error = e;
          vm.inProgress = false;
        });
    };
  });
