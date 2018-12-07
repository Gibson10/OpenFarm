import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .directive('listings', function (){
      return {
        restrict: 'E',
        templateUrl: 'client/templates/main/listings.html'
      }
    });
