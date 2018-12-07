import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
  .module('salephone')
  .controller('MsgCtrl', MsgCtrl);

function MsgCtrl (
                  $scope,
                  $reactive,
                  $sce,
                  $cordovaToast,
                  $state,
                  $stateParams,
                  $ionicLoading,
                  $ionicScrollDelegate,
                  $timeout
                  ) {

  $reactive(this).attach($scope);
  var self = this;

  this.subscribe('chatMsg', () => [ $stateParams.chatId ], {
    onReady: function() {
      return;
    }
  });

  this.subscribe('thisChat', () => [ $stateParams.chatId ], {
    onReady: function() {
      if( !ChatRoom.findOne({ _id: $stateParams.chatId }) ) {
        $state.go('app.chatlist');
      }
      return;
    }
  });

  this.helpers({
    thisUser: () => Meteor.userId(),
    messages: () => Messages.find({ chatID: $stateParams.chatId },{ sort: { sent: 1 } }),
    chat: () => ChatRoom.findOne({ _id: $stateParams.chatId }),
    otherUser: () => Profile.findOne({
        $and: [{
          profID: { $ne: Meteor.userId() }
        },{
          $or:[{
            profID: self.getReactively('chat.buyer')
          },{
            profID: self.getReactively('chat.seller')
          }]
        }]
    })
  });

  //Get messages and render as HTML. Set message as read.
  this.chatmsg = function(id) {
    if ( Messages.findOne({ _id: id }) ) {
      //Method is located at tapshop/lib/methods/messages.js
      Meteor.call('setRead', id);
      return $sce.trustAsHtml( Messages.findOne({ _id: id }).body );
    } else {
      return;
    }
  },

  //Send a new message.
  this.sendMsg = function() {
    if ( self.chat.buyerActive === true && self.chat.sellerActive === true ) {
      if ( this.body ){
        let newmsg = {
          chatID: self.chat._id,
          body: this.body.toString().replace(/(?:\r\n|\r|\n)/g, '<br />')
        };
        //Method is located at tapshop/lib/methods/messages.js
        Meteor.call('newMsg', newmsg, function(err) {
          if (!err) {
            console.log('Message sent.');
            if (Meteor.isCordova) {
              cordova.plugins.Keyboard.close();
            } else {
              document.getElementById("chatInput").blur();
            }
          }
          else {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
              cordova.plugins.Keyboard.close();
            } else {
              toastr.error('Error. Please try again.');
              document.getElementById("chatInput").blur();
            }
          }
        });
      }
      this.body = '';
    }
    else {
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Other user has left.');
        cordova.plugins.Keyboard.close();
      } else {
        toastr.error('Other user has left.');
        document.getElementById("chatInput").blur();
      }
      this.body = '';
    }
  };

  //Auto scroll down to the last message.
  this.showMsg = function(isLast) {
    if (isLast === true) {
      $ionicScrollDelegate.scrollBottom();
      $ionicLoading.hide();
      return;
    } else {
      return;
    }
  }

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    return;
  });

};
