import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('BuyerCtrl', BuyerCtrl);

 function BuyerCtrl(
                    $scope,
                    $stateParams,
                    $reactive,
                    $ionicViewSwitcher,
                    $ionicLoading,
                    $ionicSlideBoxDelegate,
                    $ionicPopup,
                    $sce,
                    $state,
                    $rootScope,
                    $cordovaToast
                  ) {

  $reactive(this).attach($scope);
  var self = this;

  this.subscribe('productBuyer', () => [ $stateParams.listingId ], {
    onReady: function() {
        let post = Listings.findOne({ _id: $stateParams.listingId })
        self.subscribe('product', () => [ post.productID ], {
          onReady: function() {
            return;
          }
        });
      $ionicSlideBoxDelegate.update();
      $ionicLoading.hide();
    }
  });

  this.helpers({
    listing: () => Listings.findOne({ _id: $stateParams.listingId }),
    product: () => Products.findOne({ _id: self.getReactively('listing.productID') }),
    postOffer: () => Offers.findOne({ listingID: $stateParams.listingId }, { sort: { offerAmount: -1, offerDate: 1 }}),
    offerCount: () => Offers.find({ listingID: $stateParams.listingId }).count(),
    hasOffer: () => Offers.find({ listingID: $stateParams.listingId, offerBy: Meteor.userId() }).count()
  });

  this.userId = Meteor.userId();

  //Get uploaded images from database.
  this.uploads = function(imgId) {
    let upload = Uploads.findOne({ _id: imgId });
    if ( upload ) {
      return upload.link();
    } else {
      return;
    }
  };

  //Get profile of seller of this listing.
  this.seller = function(id) {
    return Profile.findOne({ profID: id });
  };

  //Get profile image of seller of this listing.
  this.sellerImg = function(id) {
    return ProfileImg.findOne({ 'meta.userId': id });
  };

  //Render listing description as HTML.
  this.notes = function(notes) {
    return $sce.trustAsHtml(notes);
  };

  //Image slider funciton.
  this.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  //Load chat with seller.
  this.buyNow = function() {
    if ( Meteor.userId() ) {
      $rootScope.$broadcast('loadspinner');

      //Check for existing chat with same user on same listing.
      let chatCheck = ChatRoom.find({
                        listingID: self.listing._id,
                        sellerActive: true
                      }).count();
      if ( chatCheck != 0 ) {
        let goChat =  ChatRoom.findOne({
                        listingID: self.listing._id,
                        sellerActive: true
                      });
        $state.go('app.chat', { chatId: goChat._id });
      }
      else {
        var prod = self.listing.title;

        //Save chat details to object.
        let newChat = {
              listingID: self.listing._id,
              prodName: prod,
              offerID: null
        }

        //Create new chat room.
        //Method is located at tapshop/server/methods/messages_server.js
        Meteor.call('loadChat', newChat, 'buy now', function(err, chatid) {
          if (!err) {

            //Method is located at tapshop/server/methods/messages_server.js
            Meteor.call('systemMsg', 'Buy', chatid);
            $state.go('app.chat', { chatId: chatid });
          }
          else {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            $ionicLoading.hide();
            return;
          }
        });
      }
    }
    else {
      $ionicViewSwitcher.nextDirection("back");
      $state.go('app.login');
    }
  };

  //Load popup to send offer to seller.
  this.newOffer = function() {
    if ( Meteor.userId() ) {
      let thisPost = self.listing;
      var myPopup = $ionicPopup.show({
        template: '<input type="tel" ng-model="vm.offer" autofocus>',
        title: 'Enter your offer amount.',
        scope: $scope,
        buttons: [{
          text: 'Cancel'
        },{
          text: '<b id="send-offer">Send</b>',
          type: 'button-positive',
          onTap: function(e) {
            if ( $scope.vm.offer && $scope.vm.offer > 0 ) {

              let sendOffer = {
                listingID: thisPost._id,
                offerAmount: parseInt( $scope.vm.offer.replace(/,/g, '') )
              }
              //Method is located at tapshop/lib/methods/offers.js
              Meteor.call('newOffer', sendOffer, thisPost.productID, function(err){
                if (!err) {
                  if (Meteor.isCordova) {
                    $cordovaToast.showShortBottom('Offer Sent');
                  } else {
                    toastr.success('Offer Sent');
                  }
                  //Method is located at tapshop/server/methods/feed_server.js
                  Meteor.call('insertFeed', 'newOffer', thisPost.listedBy, thisPost.title, thisPost._id );
                }
                else {
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Error. Please try again.');
                  } else {
                    toastr.error('Error. Please try again.');
                  }
                }
              });
            }
            else {
              e.preventDefault();
            }
          }
        }]
      });
    }
    else {
      $ionicViewSwitcher.nextDirection("back");
      $state.go('app.login');
    }
  };

  //Load popup to change or remove current offer to seller.
  this.changeOffer = function() {
    if ( Meteor.userId() ) {
      let thisPost = self.listing;
      self.myOffer = Offers.findOne({ listingID: self.listing._id, offerBy: Meteor.userId() });

      var myPopup = $ionicPopup.show({
        template: '<input type="tel" ng-model="vm.myOffer.offerAmount" autofocus>',
        title: 'Change your current offer:',
        scope: $scope,
        buttons: [{
          text: '<i class="fa fa-trash-o fa-lg"></i>',
          type: 'button-assertive',
          onTap: function(e) {

            //Method is located at tapshop/lib/methods/offers.js
            Meteor.call('removeOffers', self.myOffer._id, thisPost._id, thisPost.productID, function(err) {
              if (!err) {
                if (Meteor.isCordova) {
                  $cordovaToast.showShortBottom('Offer Removed');
                } else {
                  toastr.success('Offer Removed');
                }
              }
              else {
                if (Meteor.isCordova) {
                  $cordovaToast.showLongBottom('Error. Please try again.');
                } else {
                  toastr.error('Error. Please try again.');
                }
              }
            });
          }
        },{
          text: 'Back'
        },{
          text: '<b id="send-offer">Send</b>',
          type: 'button-positive',
          onTap: function(e) {
            if ( self.myOffer.offerAmount && self.myOffer.offerAmount > 0 ) {

              //Method is located at tapshop/lib/methods/offers.js
              Meteor.call('changeOffer', self.myOffer._id, parseInt( self.myOffer.offerAmount.replace(/,/g, '') ), function(err){
                if (!err) {
                  if (Meteor.isCordova) {
                    $cordovaToast.showShortBottom('Offer Updated');
                  } else {
                    toastr.success('Offer Updated');
                  }

                  //Method is located at tapshop/server/methods/feed_server.js
                  Meteor.call('insertFeed', 'changeOffer', thisPost.listedBy, thisPost.title, thisPost._id );
                }
                else {
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Error. Please try again.');
                  } else {
                    toastr.error('Error. Please try again.');
                  }
                }
              });
            }
            else {
              e.preventDefault();
            }
          }
        }]
      });
    }
    else {
      $ionicViewSwitcher.nextDirection("back");
      $state.go('app.login');
    }
  };

  this.isSeller = $state.is('app.myproduct');

  //Refresh data function.
  $scope.refresh = function() {
    $ionicSlideBoxDelegate.update();
    $state.reload('app.product');
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    //Add to view count of this listing.
    //Method is located at tapshop/lib/methods/listings.js
    Meteor.call('addView', $stateParams.listingId);
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
  });
};
