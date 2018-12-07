import { _meteorAngular } from 'meteor/angular';

angular
  .module('salephone')
  .directive('loading', function (){
    return {
      restrict: 'E',
      template: '<img ng-src="/images/utils/officialogo.png" style="width: 100%; height: 100%;">',
      controller: function($scope) {
        $scope.hasLoaded = false;
      }
    }
  });

angular
  .module('salephone')
  .directive('preloader', function () {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.on('load', function() {
          element.parent().find('loading').addClass('ng-hide');
          element.removeClass('ng-hide');
        });
      }
    };
  });
