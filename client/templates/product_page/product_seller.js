import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('SellerCtrl', SellerCtrl);

 function SellerCtrl(
                      $scope,
                      $stateParams,
                      $reactive,
                      $ionicSideMenuDelegate,
                      $ionicLoading,
                      $ionicSlideBoxDelegate,
                      $ionicPopup,
                      $sce,
                      $ionicModal,
                      $state,
                      $rootScope,
                      $cordovaToast
                    ){

  $reactive(this).attach($scope);
  var self = this;

  this.subscribe('productSeller', () => [ $stateParams.listingId ], {
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
    offers: () => Offers.find({ listingID: $stateParams.listingId}, { sort: { offerAmount: -1, offerDate: 1 }})
  });

  //Get uploaded images from database.
  this.uploads = function(imgId) {
    let upload = Uploads.findOne({ _id: imgId });
    if ( upload ) {
      return upload.link();
    } else {
      return;
    }
  };

  //Render listing description as HTML.
  this.notes = function(notes) {
    return $sce.trustAsHtml(notes);
  };

  //Get profile of users that sent offers.
  this.profile = function (offerby) {
    return Profile.findOne({ profID: offerby});
  }

  //Get profile image of users that sent offers.
  this.profileImg = function (offerby) {
    return ProfileImg.findOne({ 'meta.userId': offerby });
  }

  //Image slider funciton.
  this.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  //Modal to show users with offers.
  $ionicModal.fromTemplateUrl('client/templates/product_page/view_offer.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  //Show modal.
  this.viewOffers = function() {
    $scope.modal.show();
  };

  //Close modal, remove user selection.
  this.closeOffer = function() {
    this.buyer = '';
    $scope.modal.hide();
  };

  //Load chat with selected user.
  this.acceptOffer = function() {
    $rootScope.$broadcast('loadspinner');
    if ( this.buyer != null || this.buyer != '' ) {

      let selectBuyer = Offers.findOne({ _id: this.buyer });

      let chatCheck = ChatRoom.find({
        listingID: self.listing._id,
        buyer: selectBuyer.offerBy,
        buyerActive: true
      }).count();

      //Check for existing chat with same user on same listing.
      if ( chatCheck !== 0 ) {

        let goChat = ChatRoom.findOne({
          listingID: self.listing._id,
          buyer: selectBuyer.offerBy,
          buyerActive: true
        });

        $scope.modal.remove();
        $state.go('app.chat', { chatId: goChat._id });
      }
      else {

        //Save chat details to object.
        let newChat = {
              listingID: self.listing._id,
              prodName: self.listing.title,
              offerID: this.buyer
        }

        //Create new chat room.
        //Method is located at tapshop/server/methods/messages_server.js
        Meteor.call('loadChat', newChat, 'accept', function(err, chatid) {
          if (!err) {
            //Method is located at tapshop/server/methods/messages_server.js
            Meteor.call('systemMsg', 'Accept', chatid);
            $scope.modal.remove();
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
      console.log('Please select a buyer.');
      $ionicLoading.hide();
      return;
    }
  };

  //Load popup to change selling price of this listing.
  this.changePrice = function() {
    let thisPost = self.listing;
    let myPopup = $ionicPopup.show({
          template: '<input type="tel" ng-model="vm.listing.sellPrice" autofocus>',
          title: 'Enter your new selling price:',
          scope: $scope,
          buttons: [{
            text: 'Cancel',
            onTap: function(e) {
              $scope.vm.listing.sellPrice = thisPost.sellPrice;
              myPopup.close();
            }
          },{
            text: '<b>Update</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ( $scope.vm.listing.sellPrice ) {
                let newAmount = parseInt( $scope.vm.listing.sellPrice.replace(/,/g, '') );

                //Method is located at tapshop/lib/methods/listings.js
                Meteor.call('changePrice', thisPost._id, newAmount, function(err, success) {
                  if (!err) {
                    if (Meteor.isCordova) {
                      $cordovaToast.showShortBottom('Price Updated');
                    } else {
                      toastr.success('Price Updated');
                    }
                    if ( Offers.find({listingID: thisPost._id}).count() !== 0 ) {
                      Offers.find({listingID: thisPost._id}).forEach( function(thisOffer) {
                        //Method is located at tapshop/server/methods/feed_server.js
                        Meteor.call('insertFeed', 'changePrice', thisOffer.offerBy, thisPost.title, thisPost._id);
                      });
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
              else {
                e.preventDefault();
              }
            }
          }]
    });
  };

  //Show popup to confirm deletion of listing, and delete on confirm.
  this.delete = function() {
    let thisPost = self.listing;
    let confirmPopup = $ionicPopup.confirm({
      title: 'Delete Post',
      template: 'Do you want to delete this post?',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      },{
        text: '<b>Delete</b>',
        type: 'button-assertive',
        onTap: function() {
          $rootScope.$broadcast('loadspinner');
          //Method is located at tapshop/lib/methods/listings.js
          Meteor.call('removeListing', thisPost._id, function(err) {
            if (!err) {
              if (Meteor.isCordova) {
                $cordovaToast.showShortBottom('Post Removed');
              } else {
                toastr.success('Post Removed');
              }
              $state.go('app.sell');
            }
            else {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
                $ionicLoading.hide();
              }
            }
          })
        }
      }]
    });
  };

  this.isSeller = $state.is('app.myproduct');

  //Refresh data function.
  $scope.refresh = function() {
    $ionicSlideBoxDelegate.update();
    $state.reload('app.myproduct');
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    $scope.modal.remove();
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
  });
};
