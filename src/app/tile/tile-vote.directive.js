/* global angular */
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

        function fetchTile () {
          $http.get('/api/tiles/random')
            .success((tile) => {
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

        scope.showNext = () => {
          scope.tile = scope.next;
          start = Date.now();
          scope.next = undefined;
          fetchTile();
        };

        function getCounts () {
          $http.get('/api/tiles/count')
            .success((counts) => {
              scope.counts = counts;
            });
        }

        function doVote (id, vote) {
          vote['ponder_time'] = Date.now() - start;
          $http
            .post(`/api/tiles/${id}/vote`, vote)
            .success(() => {
              getCounts();
              scope.showNext();
            });
        }

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
