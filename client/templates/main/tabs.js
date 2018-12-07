import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .directive('tabs', function (){
      return {
        restrict: 'E',
        templateUrl: 'client/templates/main/tabs.html',
        controller: function($scope, $state){

          //Highlight selected tab.
          if( $state.is('app.shop') === true ) {
            $scope.activeTab = 'Shop';
          }
          else if ( $state.is('app.sell') === true ) {
            $scope.activeTab = 'Sell';
          }
          else if ( $state.is('app.myoffers') === true ) {
            $scope.activeTab = 'Offers';
          }
          else if ( $state.is('app.chatlist') === true) {
            $scope.activeTab = 'Chat';
          }
        }
      }
    });
