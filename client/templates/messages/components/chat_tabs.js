import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .directive('chats', function() {
      return {
        restrict: 'E',
        templateUrl: 'client/templates/messages/components/chat_tabs.html',
        controllerAs: 'tab',
        controller: function(
                          $scope,
                          $state,
                          $stateParams,
                          $ionicViewSwitcher
                        ){
      if ( $state.is('app.chat') === true ) {
        $scope.viewChat = true;
      } else if ( $state.is('app.chatinfo') === true ) {
        $scope.viewChat = false;
      }

      this.selectChat = function() {
          $ionicViewSwitcher.nextDirection("back");
          $state.go('app.chat', { chatId: $stateParams.chatId });
      };

      this.selectDetails = function() {
          $ionicViewSwitcher.nextDirection("forward");
          $state.go('app.chatinfo', { chatId: $stateParams.chatId });
      };
    }
  }
});
