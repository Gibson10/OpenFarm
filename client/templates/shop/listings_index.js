import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

angular
    .module('salephone')
    .controller('ListingsCtrl', ListingsCtrl);

function ListingsCtrl(
                      $scope,
                      $stateParams,
                      $state,
                      $reactive,
                      $rootScope,
                      $ionicLoading,
                      $timeout,
                      $ionicScrollDelegate,
                      $ionicPopover,
                      $ionicPopup
                    ){
  $reactive(this).attach($scope);
  var self = this;
  this.listings = [];
  this.contentLoaded = false;
  self.noPosts = "";

  //Variable for pagination.
  self.paginate = false;

  //Variables for infinite scroll.
  self.options = {
    loaded: 10,
    skip: 0,
    distance: null,
    coordinates: null,
    sort: 'date'
  };
  self.sort = 'date';

  //Set listing data options.
  self.selector =[{
    productID: $stateParams.productId,
    active: true
  },
  {
    limit: self.options.loaded
  }];

  this.getListings = function(){
             
      //Load listings on scroll.
      this.subscribe('listingIndex', () => [ $stateParams.productId, self.options ], {
        onReady: function() {
                  
          self.selector[1] = _.extend(self.selector[1], {
            limit: self.options.loaded,
            skip: self.options.skip
          });

          //Get count of all listings in server.
          //Method is located at tapshop/lib/methods/app_methods.js
          Meteor.call('allPosts', $stateParams.productId, self.options, function(err, count) {
            self.allposts = count;
                        
            self.listings = Listings.find(self.selector[0], self.selector[1]).fetch();
            
            self.contentLoaded = true;
            self.noPosts = "No posts available.";

            if (
              (self.options.loaded >= 20 && ( self.options.skip + self.options.loaded ) < self.allposts) ||
              (self.options.skip !== 0 && ( self.options.skip + self.options.loaded ) >= self.allposts)
            ){
              self.paginate = true;
            }
          
            $ionicLoading.hide();
            
            return;            
            
          });          
        },
        onStop: function(err){
          if(err){
            self.contentLoaded = true;
            self.noPosts = "No internet connection.";
            return;
          }
        }
    });
  }

  this.getListings();

  this.helpers({
    myprofile: () => Profile.findOne({ profID: Meteor.userId() })
  });

  //Get image of this listing.
  this.upload = function(id) {
    let upload = Uploads.findOne({ 'meta.listID': id });
    if ( upload ) {
      return upload.link();
    } else {
      return;
    }
  };

  //Get offers of this listing.
  this.offer = function(id) {
    if ( Offers.find({ listingID: id }).count() !== 0 ) {
      return Offers.findOne({ listingID: id });
    }
    else {
      return false;
    }
  };

  //Go to Product Page of listing.
  this.go = function(listingId) {
    if ( Listings.findOne({ _id: listingId }).listedBy != Meteor.userId() ) {
      $state.go('app.product', { listingId: listingId });
    }
    else {
      $state.go('app.myproduct', { listingId: listingId });
    }
  };

  //Infinite scroll function.
  $scope.loadMore = function() {
    $timeout( function(){
      if ( (self.options.loaded + 5) > 20 ) {
        self.options.loaded = 20;
      } else {
        self.options.loaded += 5;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
      self.getListings();
      return;
    }, 2000);
  };

  //Refresher function.
  $scope.refresh = function() {
    self.paginate = false;
    self.noPosts = "";
    self.listings = [];
    self.options.skip = 0;
    self.options.loaded = 10;
    $scope.$broadcast('scroll.refreshComplete');
    return self.getListings();
  };

  //Pagination Back Button.
  this.back = function() {
    self.paginate = false;
    self.noPosts = "";
    self.listings = [];
    $ionicScrollDelegate.scrollTop();
    $rootScope.$broadcast('loadspinner');
    self.options.loaded = 10;
    if ( self.options.skip >= 20 ) {
      self.options.skip -= 20;
    }
    else{
      self.options.skip = 0;
    }
    
    return self.getListings();
  };

  //Pagination Forward Button.
  this.next = function() {
    self.paginate = false;
    self.noPosts = "";
    self.listings = [];
    $ionicScrollDelegate.scrollTop();
    $rootScope.$broadcast('loadspinner');
    self.options.loaded = 10;
    self.options.skip += 20;
    
    return self.getListings();   
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

  //Set by max distance.
  this.setDistance = function(){
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

            if( parseInt(self.max) !== self.options.distance ){
              $rootScope.$broadcast('loadspinner');
            }

            if ( self.max && isNaN( self.max ) === false ) {
              self.listings = [];

              let coords = Session.get('myCoordinates');

              self.options = _.extend(self.options,{
                loaded: 10,
                skip: 0,
                distance: parseInt(self.max),
                coordinates: [ coords.lng, coords.lat ]
              });

              self.selector[0] = _.extend(self.selector[0],{
                location: {
                  $near: {
                    $geometry: {
                      type: "Point",
                      coordinates: [ self.options.coordinates[0], self.options.coordinates[1] ]
                    },
                    $maxDistance: self.options.distance * 1000
                  }
                }               
              });              

              self.paginate = false;
              $ionicScrollDelegate.scrollTop();

              return self.getListings();              
            }
            else {
              self.listings = [];

              self.options = _.extend(self.options,{
                loaded: 10,
                skip: 0,
                distance: null,
                coordinates: null
              });

              if( self.options.sort !== 'distance'){
                self.selector[0] = {
                  productID: $stateParams.productId,
                  active: true
                }
              }

              self.paginate = false;
              $ionicScrollDelegate.scrollTop();

              return self.getListings();           
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

  //Show sort options.
  this.sortOptions = function($event){
    $scope.popover.show($event);
  }

  //Set sort option.
  this.getSort = function(option){
    $scope.popover.hide();
    if( option !== self.options.sort ){
      $rootScope.$broadcast('loadspinner');
      self.listings = [];
      
      if( option === 'distance' ){
        if ( Session.get('myCoordinates') ){
          
          let coords = Session.get('myCoordinates');
          
          self.options = _.extend(self.options,{
            loaded: 10,
            skip: 0,
            sort: 'distance',
            coordinates: [ coords.lng, coords.lat ]
          });

          self.paginate = false;
          $ionicScrollDelegate.scrollTop();

          self.selector[1] = {
            limit: self.options.loaded
          }
        
          if( self.options.distance === null ){
            self.selector[0] = _.extend(self.selector[0],{
              location: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [ self.options.coordinates[0], self.options.coordinates[1] ]
                  },
                  $minDistance: 0
                }
              }
            });
          }

        }
        else {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Please enable GPS and try again.');
          } else {
            toastr.error('Please enable GPS and try again.');
          }
          $ionicLoading.hide();
          self.sort = self.options.sort || 'date';
        }
      }
      else if ( option === 'date' ){
        self.options = _.extend(self.options,{
          loaded: 10,
          skip: 0,
          sort: 'date'
        });

        if( self.options.distance === null ){
          self.selector[0] = {
            productID: $stateParams.productId,
            active: true
          }
        }

        self.selector[1] = _.extend(self.selector[1],{
          sort: { postDate: -1 }
        });

        self.paginate = false;
        $ionicScrollDelegate.scrollTop();
      }
      else if ( option === 'price' ){
        self.options = _.extend(self.options,{
          loaded: 10,
          skip: 0,
          sort: 'price'
        });

        if( self.options.distance === null ){
          self.selector[0] = {
            productID: $stateParams.productId,
            active: true
          }
        }

        self.selector[1] = _.extend(self.selector[1],{
          sort: { sellPrice: 1 }
        });

        self.paginate = false;
        $ionicScrollDelegate.scrollTop();
      }
      
      return self.getListings();
    }
    else {
      return;
    }
  }

  this.isSeller = $state.is('app.sell');
  this.isOffer = $state.is('app.myoffers');

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    if ( !document.getElementById("content-main") ) {
      $rootScope.$broadcast('loadspinner');
    }
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }

    $ionicPopover.fromTemplateUrl('client/templates/shop/components/sort.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    //Show Ad on this Page.
    if (Meteor.isCordova && AdMob) {
      AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    } else {
      return;
    }
  });

  $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    $scope.popover.remove();
    //Hide Ad on on leave.
    if (Meteor.isCordova && AdMob) {
      AdMob.hideBanner();
    } else {
      return;
    }
  });
};
