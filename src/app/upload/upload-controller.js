'use strict';

angular
  .module('varroa.upload')
  .controller('UploadCtrl', function (_, $upload, $timeout, $q) {
    const vm = this;

    vm.files = [];
    vm.uploads = [];

    const uploadFile = (file, i) => {
      const deferred = $q.defer();

      vm.uploads[i] = { i: i, progress: 0 };
      $upload
        .upload({
          url: '/api/upload',
          file: file,
          fields: {
            name: vm.name
          }
        })
        .progress((e) => {
          const { loaded, total } = e;

          if (vm.uploads[i]) {
            vm.uploads[i].progress = parseInt(100.0 * loaded / total);
          }
        })
        .success(() => deferred.resolve())
        .error((e) => {
          deferred.reject(e);
        });

      return deferred.promise;
    };

    vm.submit = () => {
      vm.error = vm.success = undefined;
      vm.inProgress = true;

      const promises = _.map(vm.files, uploadFile);

      $q.all(promises)
        .then(() => {
          vm.success = true;
          vm.inProgress = false;
          vm.files = [];

          $timeout(() => vm.uploads = [], 3000);
        })
        .catch((e) => {
          vm.error = e;
          vm.uploads = [];
          vm.inProgress = false;
        });
    };
  });
