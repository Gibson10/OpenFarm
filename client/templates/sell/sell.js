import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('SellCtrl', SellCtrl);

 function SellCtrl (
                    $state,
                    $scope,
                    $reactive,
                    $rootScope,
                    $ionicLoading,
                    $ionicHistory,
                    $timeout,
                    $ionicScrollDelegate
                  ){
    $reactive(this).attach($scope);
    var self = this;
    this.contentLoaded = false;
    this.noItems = "Login to view your posts."

    //Variable for pagination.
    self.paginate = false;

    //Variables for infinite scroll.
    self.options = {
      loaded: 10,
      skip: 0
    };
    self.limit = self.options.loaded;

    //Get count of all posts in server.
    //Method is located at tapshop/lib/methods/app_methods.js
    Meteor.call('myAllPosts', function(err, count) {
      self.allposts = count;
    });



    //Load listings on scroll.
    this.subscribe('myPosts', () => [ self.getReactively('options', true) ], {
      onReady: function() {
        self.limit = self.options.loaded;
        let publishedCount = Listings.find({ active: true }).count();
        
        if (
          (self.options.loaded >= 50 && ( self.options.skip + self.options.loaded ) < self.allposts) ||
          (self.options.skip !== 0 && ( self.options.skip + self.options.loaded ) >= self.allposts)
        ){
          self.paginate = true;
        }

        self.contentLoaded = true;

        if ( Meteor.userId() ) {
          self.noItems = "You have no items for sale."
        } 
        else {
          self.noItems = "Login to view your posts."
        }

        $ionicLoading.hide();
        return;
      },
      onStop: function(err){
        if(err){
          self.contentLoaded = true;
        
          if ( Meteor.userId() ) {
            self.noItems = "You have no items for sale."
          } 
          else {
            self.noItems = "Login to view your posts."
          }
          return;
        }
      }       
    });

    this.helpers({
      noPosts: () => this.getReactively('noItems'),
      listings: () => Listings.find({
          listedBy: Meteor.userId(),
          active: true
        },{
          limit: self.getReactively('limit'),
          sort: { postDate: -1 }
        })
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
        if ( Offers.findOne({ listingID: id }) ) {
            return Offers.findOne({
              listingID: id
            },{
              sort: {
                offerAmount: -1,
                offerDate: 1
              }
            });
        } else {
            return false;
        }
    };

    //Go to Product Page of listing.
    this.go = function(id) {
      $state.go('app.myproduct', { listingId: id });
    };

    //Infinite scroll function.
    $scope.loadMore = function() {
      $timeout( function(){
        if ( (self.options.loaded + 5) > 50 ) {
          self.options.loaded = 50;
        } else {
          self.options.loaded += 5;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, 2000);
    };

    //Refresher function.
    $scope.refresh = function() {
      self.options.skip = 0;
      self.options.loaded = 10;
      $state.reload('app.sell');
      $scope.$broadcast('scroll.refreshComplete');
    };

    //Pagination Back Button.
    this.back = function() {
      $rootScope.$broadcast('loadspinner');
      self.options.loaded = 10;
      if ( self.options.skip !== 0 ) {
        self.options.skip -= 50;
      }
      self.paginate = false;
      $ionicScrollDelegate.scrollTop();
    };

    //Pagination Forward Button.
    this.next = function() {
      $rootScope.$broadcast('loadspinner');
      self.options.loaded = 10;
      self.options.skip += 50;
      self.paginate = false;
      $ionicScrollDelegate.scrollTop();
    };

    this.isSeller = $state.is('app.sell');

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
      //Show Ad on this Page.
      if (Meteor.isCordova && AdMob) {
        AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
      } else {
        return;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
      //Hide Ad on on leave.
      if (Meteor.isCordova && AdMob) {
        AdMob.hideBanner();
      } else {
        return;
      }
    });
};
