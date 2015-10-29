/* global angular, _ */
'use strict';

angular
  .module('varroa.tile')
  .directive('tileVote', (
    $http
  ) => {
    return {
      restrict: 'E',
      link: (scope) => {
        let start = Date.now();
        scope.expert = false;
        scope.tiles = [];

        scope.fetchTiles = () => {
          if (scope.fetching) {
            return;
          }
          scope.fetching = true;
          $http.get('/api/tiles/random')
            .success((tiles) => {
              scope.fetching = false;
              scope.tiles.push(...tiles);
              scope.tiles = _.uniq(scope.tiles, '_id');
              if (scope.tiles.length < 10) {
                scope.fetchTiles();
              }
            });
        };

        scope.fetchTiles();
        getCounts();

        function getCounts () {
          if (scope.counting) {
            return;
          }
          scope.counting = true;
          $http.get('/api/tiles/count')
            .success((counts) => {
              scope.counting = false;
              scope.counts = counts;
            });
        }

        function doVote (id, vote) {
          vote['ponder_time'] = Date.now() - start;
          _.remove(scope.tiles, '_id', id);
          $http
            .post(`/api/tiles/${id}/vote`, vote)
            .success(() => {
              if (scope.tiles.length < 10) {
                scope.fetchTiles();
              }
              if (!scope.expert) {
                getCounts();
              }
            });
        }

        scope.showNext = () => {
          scope.tiles.shift();
          if (scope.tiles.length < 10) {
            scope.fetchTiles();
          }
        };

        scope.goExpert = () => {
          scope.expert = true;
        };

        scope.leaveExpert = () => {
          scope.expert = false;
        };

        scope.downVote = (id) => {
          doVote(id, {
            bee: false
          });
        };

        scope.upVote = (id) => {
          doVote(id, {
            bee: true
          });
        };

        scope.parasite = (id) => {
          doVote(id, {
            parasite: true
          });
        };
      },
      templateUrl: '/varroa/tile/tile-vote.html'
    };
  });
