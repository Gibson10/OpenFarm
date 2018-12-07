import { Meteor } from 'meteor/meteor';
import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .controller('SearchCtrl', SearchCtrl);

function SearchCtrl (
    $scope,
    $state,
    $reactive,
    $rootScope,
    $timeout,
    $ionicLoading,
    $ionicPlatform,
    $ionicHistory,
    $ionicViewSwitcher,
    $cordovaToast,
    $ionicScrollDelegate,
    $ionicPopover,
    $ionicPopup
  ) {
    $reactive(this).attach($scope);
    var self = this;

    //Start with empty search results.
    self.searchResults = {};
    self.searched = null;
    self.page = 0;

    //Variables for infinite scroll.
    self.options = {
      distance: null,
      coordinates: null,
      skip: 0
    };

    this.autorun( () => {
        //Run search function when there are characters on search input.
        if ( this.getReactively('search') ) {
            $timeout( function(){
              if ( !self.search || self.search === self.searched ) {
                return;
              }
              else {
                self.options.skip = 0;
                Search.search( self.search, self.options );
                self.searched = self.search;
                $ionicScrollDelegate.scrollTop();
                return;
              }
            }, 2000);
        }

        if( this.getReactively( 'isLoaded' ) || this.getReactively( 'isError' ) ){
          $ionicLoading.hide();
        }
    });

    this.helpers({
        listings() {
          return Search.getData({
            limit: 10,
            sort: {
              score: { $meta: "textScore" },
              listOfferCount: -1,
              views: -1,
              listingsCount: -1,
              postDate: -1,
              title: 1
            }
           });
        },
        isLoading() {
          return Search.getStatus().loading;
        },
        isLoaded(){
          return Search.getStatus().loading;
        },
        isError(){
          return Search.getStatus().error;
        },
        searchData(){
          return Search.getMetadata();
        },
        myprofile: () => Profile.findOne({ profID: Meteor.userId() })
    });

    //Run search on enter button.
    this.onEnter = function() {
      if (!self.search) {
        return;
      }
      else {
        $timeout( function(){
          self.options.skip = 0;
          Search.search( self.search, self.options );
          $ionicScrollDelegate.scrollTop();
          return;
        }, 1000);
      }
      if (Meteor.isCordova) {
        cordova.plugins.Keyboard.close();
      } else {
        document.getElementById("search-input").blur();
      }
    }

    //Subscribe images of listings in search results.
    this.getImage = function(listing) {
      if ( listing.isFirst ) {
        $rootScope.$broadcast('loadspinner');
      }
      if ( !Uploads.findOne({ 'meta.listID': listing.id }) ) {
        self.subscribe('searchListing', () => [ listing.id ], {
          onReady: function() {
            if ( listing.isLast ) {
              $ionicLoading.hide();
            }
            return;
          }
        })
      }
      else {
        if ( listing.isLast ) {
          $ionicLoading.hide();
        }
        return;
      }
    }

    //Get images of listings in search results.
    this.upload = function(id) {
      let upload = Uploads.findOne({ 'meta.listID': id });
      if ( upload ) {
        return upload.link();
      }
      else {
        return;
      }
    };

    //Go to product page of listing.
    this.go = function(listingId) {
      $state.go('app.product', { listingId: listingId });
    };

    this.noResults = "No items found.";

    //Pagination Back Button.
    this.back = function() {
      $ionicScrollDelegate.scrollTop();
      self.options.skip -= 10;
      if (self.options.skip < 0){
        self.options.skip = 0;
      }
      Search.search( self.search, self.options );
    };

    //Pagination Forward Button.
    this.next = function() {
      $ionicScrollDelegate.scrollTop();
      self.options.skip += 10;
      if (self.options.skip > 30){
        self.options.skip = 30;
      }
      Search.search( self.search, self.options );
    };

    //Check if user and listing has geolocation coordinates.
    this.hasCoords = function(hasLocation){
      if( Session.get('myCoordinates') && hasLocation === true ){
        return true;
      }
      else {
        return false;
      }
    };

    //Show sort options.
    this.showOptions = function($event){
      $scope.popover.show($event);
    }

    //Filter search results by distance.
    //Set by max distance.
    this.filter = function(){
      $scope.popover.hide();
      if( Session.get('myCoordinates') ){
        var myPopup = $ionicPopup.show({
          template: '<input type="tel" ng-model="vm.max" autofocus>',
          title: 'Set Max Distance (in KM)',
          scope: $scope,
          buttons: [{
            text: 'Cancel',
            onTap: function(e) {
              self.max = self.options.distance;
            }
          },{
            text: '<b>Set</b>',
            type: 'button-positive',
            onTap: function(e) {
              $rootScope.$broadcast('loadspinner');
              self.options.skip = 0;
              if ( self.max && isNaN( self.max ) === false ) {

                let coords = Session.get('myCoordinates');

                self.options = _.extend(self.options,{
                  distance: parseInt(self.max),
                  coordinates: [ coords.lng, coords.lat ]
                });

                Search.search( self.search, self.options );
                $ionicScrollDelegate.scrollTop();

              }
              else {

                self.options = _.extend(self.options,{
                  distance: null,
                  coordinates: null
                });
                
                Search.search( self.search, self.options );
                $ionicScrollDelegate.scrollTop();

              }
            }
          }]
        });
      }
      else {
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Please enable GPS and try again.');
        } else {
          toastr.error('Please enable GPS and try again.');
        }
      }

    }

    $ionicPlatform.onHardwareBackButton( function(){
      if ( $ionicHistory.backView() === null ) {
        $ionicViewSwitcher.nextDirection("back");
        $state.go('app.shop');
      }
    });

    $scope.$on('$ionicView.afterEnter', function (event, viewData) {
        $ionicLoading.hide();
        document.getElementById("search-input").focus();

        $ionicPopover.fromTemplateUrl('client/templates/main/components/search_distance.html', {
          scope: $scope
        }).then(function(popover) {
          $scope.popover = popover;
        });
    });

    $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
      $scope.popover.remove();
    });
};
