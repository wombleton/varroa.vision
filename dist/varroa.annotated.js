'use strict';

angular.module('varroa.upload', ['ngFileUpload']);
'use strict';

angular.module('varroa.upload').controller('UploadsCtrl', ["$http", function ($http) {
  var vm = this;

  vm.uploads = [];

  $http.get('/api/uploads').success(function (data) {
    vm.uploads = data;
    if (vm.uploads.length) {
      vm.select(0);
    }
  });

  var setSelected = function setSelected() {
    if (vm.index > vm.uploads.length - 1) {
      vm.index = 0;
    }
    if (vm.index < 0) {
      vm.index = vm.uploads.length - 1;
    }
    vm.selected = vm.uploads[vm.index];
  };

  vm.next = function () {
    vm.index++;
    setSelected();
  };

  vm.prev = function () {
    vm.index--;
    setSelected();
  };

  vm.select = function ($index) {
    vm.index = $index;
    setSelected();
  };
}]);
'use strict';

angular.module('varroa.upload').controller('UploadCtrl', ["_", "$upload", "$timeout", "$q", function (_, $upload, $timeout, $q) {
  var vm = this;

  vm.files = [];
  vm.uploads = [];

  var uploadFile = function uploadFile(file, i) {
    var deferred = $q.defer();

    vm.uploads[i] = { i: i, progress: 0 };
    $upload.upload({
      url: '/api/uploads',
      file: file,
      fields: {
        name: vm.name
      }
    }).progress(function (e) {
      var loaded = e.loaded;
      var total = e.total;

      if (vm.uploads[i]) {
        vm.uploads[i].progress = parseInt(100.0 * loaded / total);
      }
    }).success(function () {
      return deferred.resolve();
    }).error(function (e) {
      deferred.reject(e);
    });

    return deferred.promise;
  };

  vm.submit = function () {
    vm.error = vm.success = undefined;
    vm.inProgress = true;

    var promises = _.map(vm.files, uploadFile);

    $q.all(promises).then(function () {
      vm.success = true;
      vm.inProgress = false;
      vm.files = [];

      $timeout(function () {
        return vm.uploads = [];
      }, 3000);
    })['catch'](function (e) {
      vm.error = e;
      vm.uploads = [];
      vm.inProgress = false;
    });
  };
}]);
/* global angular */
'use strict';
angular.module('varroa.tile', []).config(["$stateProvider", function ($stateProvider) {
  $stateProvider.state('tilevote', {
    parent: 'varroa',
    template: '<tile-vote></tile-vote>',
    url: '/categorise'
  });
}]);
/* global angular */
'use strict';

angular.module('varroa.tile').directive('tileVote', ["$http", function ($http) {
  return {
    restrict: 'E',
    link: function link(scope) {
      var start = Date.now();

      function fetchTile() {
        $http.get('/api/tiles/random').success(function (tile) {
          if (!scope.tile) {
            scope.tile = tile;
            fetchTile();
          } else {
            scope.next = tile;
          }
        });
      }

      fetchTile();
      getCounts();

      scope.showNext = function () {
        scope.tile = scope.next;
        start = Date.now();
        scope.next = undefined;
        fetchTile();
      };

      function getCounts() {
        $http.get('/api/tiles/count').success(function (counts) {
          scope.counts = counts;
        });
      }

      function doVote(id, vote) {
        vote['ponder_time'] = Date.now() - start;
        $http.post('/api/tiles/' + id + '/vote', vote).success(function () {
          getCounts();
          scope.showNext();
        });
      }

      scope.downVote = function (id) {
        doVote(id, {
          bee: false
        });
      };

      scope.upVote = function (id) {
        doVote(id, {
          bee: true
        });
      };

      scope.parasite = function (id) {
        doVote(id, {
          parasite: true
        });
      };
    },
    templateUrl: '/varroa/tile/tile-vote.html'
  };
}]);
/* global angular */
'use strict';

angular.module('varroa', ['ui.router', 'angularMoment', 'varroa.upload', 'varroa.tile', 'angulartics.google.analytics']).constant('_', window._).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('varroa', {
    views: {
      '@': {
        templateUrl: '/varroa/layout/layout.html'
      },
      'header@': {
        template: '<varroa-header></varroa-header>'
      }
    }
  }).state('home', {
    parent: 'varroa',
    templateUrl: '/varroa/home/home.html',
    url: '/'
  }).state('uploads', {
    parent: 'varroa',
    controller: 'UploadsCtrl as uploadsCtrl',
    templateUrl: '/varroa/upload/uploads.html',
    url: '/uploads'
  }).state('upload', {
    parent: 'varroa',
    controller: 'UploadCtrl as uploadCtrl',
    templateUrl: '/varroa/upload/upload.html',
    url: '/add'
  });

  $urlRouterProvider.otherwise('/');
}]);
/* global angular */
'use strict';

angular.module('varroa').directive('varroaHeader', function () {
  return {
    restrict: 'E',
    templateUrl: '/varroa/layout/header.html'
  };
});
'use strict';

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/home/home.html', '<div class="jumbotron text-center"><h1>Varroa Vision</h1><div class="text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Varroa_Mite.jpg"></div><dl><dt>Varroa destructor</dt><dd>a microscopic mite which is a debilitating parasite of the honeybee, causing loss of honey production.</dd></dl><h3>What We Hope</h3><p>That we can develop computer vision to detect the presence of varroa mite.</p><h3>What We Need</h3><p>Your eyes! Help categorise the images &mdash; all you need to do is to be able to spot the difference between a picture that has a bee in it, and one that doesn\'t. Simple, right?</p><button class="btn btn-lg btn-primary" ui-sref="tilevote">Get Started</button></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/layout/header.html', '<div class="container"><div class="navbar-header"><button class="navbar-toggle collapsed" type="button" data-toggle="collapse"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a ui-sref="home" class="navbar-brand">Varroa Vision</a></div><nav class="collapse navbar-collapse"><ul class="nav navbar-nav"><li><a ui-sref="tilevote">Categorise</a></li></ul></nav></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/layout/layout.html', '<header class="navbar navbar-fixed-top" role="banner" ui-view="header@"></header><section class="container"><ui-view></ui-view></section>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/tile/tile-vote.html', '<div ng-if="tile" class="text-center"><table><tbody><tr><td class="text-right"><button class="btn btn-default btn-lg" ng-click="downVote(tile._id)"><i class="fa fa-thumbs-down"></i></button><label>I don\'t see a bee</label></td><td><img ng-src="{{tile.url}}" width="128" height="128"></td><td class="text-left"><button class="btn btn-success btn-lg" ng-click="upVote(tile._id)"><i class="fa fa-thumbs-up"></i></button><label>I see a bee</label></td></tr><tr><td colspan="3"><button class="btn btn-danger" ng-click="parasite(tile._id)"><i class="fa fa-bug"></i> Varroa!</button><label>I see a varroa mite</label></td></tr><tr><td colspan="3"><button class="btn btn-link" ng-click="showNext()">Give me a different picture</button></td></tr><tr><td class="text-success"><span class="badge">{{counts.bees}}</span> bees</td><td class="text-muted"><span class="badge">{{counts.unbees}}</span> not bees</td><td class="text-danger"><span class="badge">{{counts.varroas}}</span> mites</td></tr><tr><td></td><td class="text-muted"><span class="badge">{{counts.uncategoriseds}}</span> uncategorised</td></tr></tbody></table></div><div ng-if="!tile"><div class="row form-group"><div class="col-xs-12 text-center"><i class="fa fa-3x fa-spinner fa-spin"></i></div></div></div><h3 class="text-center">What Do I Need To Do Here?</h3><p class="lead text-center">Click on the <i class="fa fa-thumbs-up text-success"></i> if the image has a bee in it; the <i class="fa fa-thumbs-down"></i> if it doesn\'t. Some of the images will be blurry and hard to make out just what they have in them. Don\'t worry &mdash; if you can\'t tell what it is, it\'s not a bee.</p><p class="lead text-center"><b>Bonus points!</b> If you spot a varroa mite, click the <i class="fa fa-bug text-danger"></i> button! Varroa mites look like this, but as you can see they\'re pretty small:</p><p class="text-center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Varroa_destructor_on_drone_66a.jpg/128px-Varroa_destructor_on_drone_66a.jpg"></p>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/upload/upload.html', '<section class="container-fluid"><div class="row"><div class="col-xs-12"><h3>Upload Files</h3><p>Upload pictures of bee frames here.</p><p>If they have mites that\'s great, but we need pictures of "normal" bees too! Ideally they\'ll be pictures from a phone.</p><form name="form"><div class="form-group"><input class="form-control input-lg" ng-model="uploadCtrl.name" placeholder="Your name — optional!"></div><div class="form-group"><div ng-file-select ng-file-drop ng-model="uploadCtrl.files" drag-over-class="{accept:\'ok\', reject:\'err\', delay:100}" class="droppable" ng-multiple="true" allow-dir="false" ng-accept="\'image/*\'" drop-available="dropAvailable" style="overflow: hidden"><div ng-hide="dropAvailable" class="ide">File Drop not available</div><div ng-show="dropAvailable && !uploadCtrl.files.length" class="">drop images here</div><div ng-repeat="file in uploadCtrl.files"><i class="fa fa-picture-o text-success"></i> {{file.name}}</div></div></div><div class="form-group"><button class="btn btn-lg btn-primary btn-block" ng-disabled="!uploadCtrl.files.length" ng-click="uploadCtrl.submit()" ng-hide="uploadCtrl.inProgress"><i class="fa fa-upload"></i> Upload</button></div><div class="form-group"><div class="progress" ng-show="uploadCtrl.uploads.length" ng-repeat="upload in uploadCtrl.uploads"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="{{upload.progress}}" aria-valuemin="0" aria-valuemax="100" style="width: {{upload.progress}}%"><span class="sr-only">{{upload.progress}}% complete</span></div></div><div class="alert alert-success" ng-show="uploadCtrl.success"><i class="fa fa-check"></i> Upload complete! Thanks!</div><div class="alert alert-danger" ng-show="uploadCtrl.error"><i class="fa fa-close"></i> Upload failed. Please try again later. <code>{{uploadCtrl.error}}</code></div></div></form></div></div></section>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('varroa');
  } catch (e) {
    module = angular.module('varroa', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/varroa/upload/uploads.html', '<section class="container-fluid"><div class="jumbotron" ng-if="uploadsCtrl.selected"><div class="col-md-8"><img class="uploads-img" src="{{uploadsCtrl.selected.url}}"></div><div class="col-md-4"><table class="table table-striped table-condensed"><tbody><tr><td>{{uploadsCtrl.index + 1}} of {{uploadsCtrl.uploads.length}} images</td></tr><tr><td>{{uploadsCtrl.selected.name}}</td></tr><tr><td>{{uploadsCtrl.selected.size}}</td></tr><tr><td><span am-time-ago="uploadsCtrl.selected.ts"></span></td></tr><tr><td><div class="btn-group"><button class="btn btn-default" ng-click="uploadsCtrl.prev()"><i class="fa fa-angle-double-left"></i></button> <button class="btn btn-default" ng-click="uploadsCtrl.next()"><i class="fa fa-angle-double-right"></i></button></div></td></tr></tbody></table></div></div><div class="row"><table class="table table-striped table-hover"><thead><tr><th>Image</th><th>Size</th><th>By</th><th>Uploaded</th></tr></thead><tbody><tr ng-repeat="upload in uploadsCtrl.uploads" ng-click="uploadsCtrl.select($index)" ng-class="{ info: $index == uploadsCtrl.index }"><td>{{upload.id}}</td><td>{{upload.size}}</td><td>{{upload.name}}</td><td><span am-time-ago="upload.ts"></span></td></tr></tbody></table></div></section>');
  }]);
})();