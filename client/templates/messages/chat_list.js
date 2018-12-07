import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('ChatCtrl', ChatCtrl);

 function ChatCtrl (
                    $scope,
                    $reactive,
                    $state,
                    $rootScope,
                    $ionicLoading,
                    $ionicHistory,
                    $timeout
                  ){
   $reactive(this).attach($scope);
   var self = this;
   self.contentLoaded = false;

   //Variable for infinite scroll.
   self.limit = 10;

   this.subscribe('chatList', () => [ self.getReactively('limit') ], {
     onReady: function() {
       $ionicLoading.hide();
       self.contentLoaded = true;
       return;
     },
    onStop: function(err){
      if(err){
        self.contentLoaded = true;
        self.noPosts = "No internet connection.";
        return;
      }
    }       
   });
   
   this.helpers({
     chats: () => ChatRoom.find({},{
       limit: self.getReactively('limit'),
       sort: { latestMsg: -1 }
      })
   });

   //Get count of all chats with users.
   //Method is located at tapshop/lib/methods/app_methods.js
   Meteor.call('allChats', function(err, count) {
     self.allchats = count;
   });

   //Get profile data of other users in chat.
   this.otherUser = function(chatid) {
     if ( ChatRoom.findOne({ _id: chatid }) ) {
      let chat = ChatRoom.findOne({ _id: chatid });
      return  Profile.findOne({
                $and: [{
                  profID: { $ne: Meteor.userId() }
                },{
                  $or: [{
                    profID: chat.buyer
                  },{
                    profID: chat.seller
                  }]
                }]
              });
     } else {
       return;
     }
   };

   //Get profile image of other users in chat.
   this.userImg = function(chatid) {
     if ( ChatRoom.findOne({ _id: chatid }) ) {
       let chat = ChatRoom.findOne({ _id: chatid });
       return ProfileImg.findOne({
                $and: [{
                  'meta.userId': { $ne: Meteor.userId() }
                },{
                  $or: [{
                    'meta.userId': chat.buyer
                  },{
                    'meta.userId': chat.seller
                  }]
                }]
              });
      } else {
        return;
      }
   };

   //Get count of all unread messages in each chat.
   this.unread = function(chatid) {
     return Messages.find({ chatID: chatid, for: Meteor.userId(), read: false }).count();
   };

   this.noPosts = "You have no active discussions."

   //Infinite scroll funcitons.
   $scope.loadMore = function() {
     $timeout( function(){
       self.limit += 5;
       $scope.$broadcast('scroll.infiniteScrollComplete');
     }, 2000);
   };

   //Refresher functions.
   $scope.refresh = function() {
     $state.reload('app.chatlist');
     $scope.$broadcast('scroll.refreshComplete');
   };

   $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
     if ( !document.getElementById("content-main") ) {
       $rootScope.$broadcast('loadspinner');
     }
     viewData.enableBack = false;
   });

   $scope.$on('$ionicView.afterEnter', function (event, viewData) {
     if ( document.getElementById("content-main") !== null ) {
       $ionicLoading.hide();
     }
   });
};
