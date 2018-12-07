import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .directive('product', function (){
      return {
        restrict: 'E',
        templateUrl: 'client/templates/product_page/components/product_page.html'
      }
    });
