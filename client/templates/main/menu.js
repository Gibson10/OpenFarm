import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

angular
    .module('salephone')
    .controller('MenuCtrl', MenuCtrl);

function MenuCtrl (
                    $scope,
                    $reactive,
                    $state,
                    $sce,
                    $ionicViewSwitcher,
                    $ionicHistory,
                    $rootScope,
                    $ionicLoading,
                    geolocation
                  ) {

    $reactive(this).attach($scope);
    var self = this;

    this.subscribe('myMenu', () => [], {
      onReady: function() { return; }
    });

    this.autorun( () => {
      if( !Session.get('myCoordinates') ) {
        
        if( window.localStorage.getItem('lat') && window.localStorage.getItem('lng') ){
          let storedCoords = {
            lat: parseFloat( window.localStorage.getItem('lat') ),
            lng: parseFloat( window.localStorage.getItem('lng') )
          }
          Session.set('myCoordinates', storedCoords);
        }

        setTimeout(function(){ 
          geolocation.getCurrentPosition()
            .then( function(result){
              Session.set('myCoordinates', result);

              if( self.myprofile ){
                Meteor.call('getLocation', result, function(err, location) {
                  if (!err) {
                    //Method is located at tapshop/lib/methods/profile.js
                    Meteor.call('updateLocation', location, result);
                    return;
                  }
                });
              }

              return;
            },
            function(error){
              console.log(error.message);
              return;
            });
        }, 3000);
      } 
    });

    this.helpers({
        currentUser: () => Meteor.user(),
        myprofile: () => Profile.findOne({ profID: Meteor.userId() }),
        unreadFeed: () => Feeds.find({ userID: Meteor.userId(), read: false }).count(),
        unreadMsg: () => Messages.find({ for: Meteor.userId(), read: false }).count(),
        profileImg: () => ProfileImg.findOne({ 'meta.userId': Meteor.userId() })
    });

    //Go to Shop tab.
    this.selectShop = function() {
        $ionicViewSwitcher.nextDirection("back");
        $state.go('app.shop');
    };

    //Go to Sell tab.
    this.selectSell = function() {
        if ( $state.is('app.shop') === true || $state.is('app.listings') === true  ) {
          $ionicViewSwitcher.nextDirection("forward");
        }
        else {
          $ionicViewSwitcher.nextDirection("back");
        }
        $state.go('app.sell');
    };

    //Go to Offers tab.
    this.selectMyOffer = function() {
        if ( $state.is('app.chatlist') === true ) {
          $ionicViewSwitcher.nextDirection("back");
        }
        else {
          $ionicViewSwitcher.nextDirection("forward");
        }
        $state.go('app.myoffers');
    };

    //Go to Messages tab.
    this.selectChat = function() {
        $ionicViewSwitcher.nextDirection("forward");
        $state.go('app.chatlist');
    };

    //Show logout button in side menu if its not on the web.
    if( Meteor.isCordova ){
      self.isMobile = true;
    }
    else {
      self.isMobile = false;
      this.logout = function() {
        $rootScope.$broadcast('loadspinner');
        Meteor.logout(function(err) {
          if (!err) {
            if ( $state.is('app.shop') ){
              $ionicLoading.hide();
            } else {
              $state.go('app.shop');
            }
          }
          else {
            $ionicLoading.hide();
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            return
          }
        });
      }
    }
};
