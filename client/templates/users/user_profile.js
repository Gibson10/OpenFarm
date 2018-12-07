import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('ProfCtrl', ProfCtrl);

 function ProfCtrl (
                    $scope,
                    $rootScope,
                    $reactive,
                    $ionicViewSwitcher,
                    $stateParams,
                    $state,
                    $sce,
                    $ionicLoading,
                    $timeout,
                    $ionicScrollDelegate
                  ){
    $reactive(this).attach($scope);
    var self = this;
    this.contentLoaded = false;

    //Pagination variable.
    self.paginate = false;

    //Variables for infinite scroll of user's listings.
    self.posts = {
      loaded: 10,
      skip: 0
    };
    self.limit = self.posts.loaded;

    //Variables for infinite scroll of user's feedback.
    self.feedLimit = 10;
    self.feedLoaded = self.feedLimit;

    //Get count of all user listings in server.
    Meteor.call('allUserPosts', $stateParams.profileId, function(err, count) {
        self.allposts = count;
    });

    //Get count of all user feedback in server.
    Meteor.call('allFeedback', $stateParams.profileId, function(err, count) {
        self.allfeedback = count;
    });

    //Load user feedback on scroll.
    this.subscribe('sellerProfile', () => [ $stateParams.profileId, self.getReactively('feedLimit') ], {
        onReady: function() {
          self.feedLoaded = self.feedLimit;
          $ionicLoading.hide();
          return;
        }
    });

    //Load user listings on scroll.
    this.subscribe('sellerPosts', () => [ $stateParams.profileId, self.getReactively('posts', true) ], {
      onReady: function() {
        self.limit = self.posts.loaded;
        let publishedCount = Listings.find({ active: true }).count();
        if (
          (self.posts.loaded >= 50 && ( self.posts.skip + self.posts.loaded ) < self.allposts) ||
          (self.posts.skip !== 0 && ( self.posts.skip + self.posts.loaded ) >= self.allposts)
        ){
          self.paginate = true;
        }
        self.contentLoaded = true;
        $ionicLoading.hide();
        return;
      }
    });

    this.helpers({
      profile: () => Profile.findOne({ _id: $stateParams.profileId }),
      feedback: () => Feedback.find({
          user: self.getReactively('profile.profID')
        },{
          limit: self.getReactively('feedLoaded'),
          sort: { postDate: -1 }
      }),
      listings: () =>  Listings.find({
          listedBy: self.getReactively('profile.profID'),
          active: true
        },{
          sort: { postDate: -1 },
          limit: self.getReactively('limit')
        }),
        profileImg: () => ProfileImg.findOne({ _id: self.getReactively('profile.profImageID') }),
        myprofile: () => Profile.findOne({ profID: Meteor.userId() })
    });

    //Variable for tabs, show feedback or user's listings.
    self.view = true;
    this.currentUser = Meteor.userId();

    //Get location of user.
    this.location = function(userLocation) {
      if (userLocation) {
        if ( userLocation.city != null ) {
          return userLocation.city
        }
        else if ( userLocation.city === null && userLocation.region !== null ) {
          return userLocation.region
        }
        else if ( userLocation.city === null && userLocation.region === null ) {
          return userLocation.country
        }
        else {
          return '-'
        }
      } else {
        return;
      }
    }

    //Functions to switch between Feedback or Listings tab.
    this.viewFeedback = function() {
        self.view = true;
    };
    this.viewPosts = function() {
        self.view = false;
    };

    //Get user feedback data and render as HTML.
    this.review = function(id) {
      if ( Feedback.findOne({ _id: id }) ) {
        return $sce.trustAsHtml( Feedback.findOne({ _id: id }).body );
      } else {
        return;
      }
    };

    //Get profile data of users that post feedback.
    this.feedbackBy = function(userId) {
        return Profile.findOne({ profID: userId });
    };

    //Get profile image of users that post feedback.
    this.postbyImg = function(userId) {
      return ProfileImg.findOne({ 'meta.userId': userId });
    };

    //Go to product page of listing.
    this.go = function(listingId) {
      $state.go('app.product', { listingId: listingId });
    };

    //Get image of listing.
    this.upload = function(id) {
      let upload = Uploads.findOne({ 'meta.listID': id });
      if ( upload ) {
        return upload.link();
      } else {
        return;
      }
    };

    //Get offers of each listing.
    this.offer = function(id) {
        if ( Offers.find({ listingID: id }).count() != 0 ) {
            return Offers.findOne({ listingID: id }, {sort: {offerAmount: -1, offerDate: 1}});
        } else {
            return false;
        }
    };

    //Check if user and listing has geolocation coordinates.
    this.hasCoords = function(hasLocation){
      if(self.myprofile){
        if ( hasLocation === true && self.myprofile.hasLocation === true ){
          return true;
        }
        else {
          return false;
        }
      } else {
        if ( hasLocation === true && Session.get('myCoordinates') ){
          return true;
        }
        else {
          return false;
        }
      }
    };

    //Infinite scroll functions.
    $scope.loadMore = function() {
      if ( self.view === false ){
        $timeout( function(){
          if ( (self.posts.loaded + 5) > 50 ) {
            self.posts.loaded = 50;
          } else {
            self.posts.loaded += 5;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 2000);
      }
      else if( self.view === true ) {
        $timeout( function(){
          self.feedLimit += 5;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 2000);
      };
    };

    //Referesher functions.
    $scope.refresh = function() {
      self.feedLimit = 10;
      self.posts.loaded = 10;
      self.posts.skip = 0;
      $state.reload('app.seller');
      $scope.$broadcast('scroll.refreshComplete');
    };

    //Pagination Back Button.
    this.back = function() {
      $rootScope.$broadcast('loadspinner');
      self.posts.loaded = 10;
      if ( self.posts.skip !== 0 ) {
        self.posts.skip -= 50;
      }
      self.paginate = false;
      $ionicScrollDelegate.scrollTop();
    };

    //Pagination Forward Button.
    this.next = function() {
      $rootScope.$broadcast('loadspinner');
      self.posts.loaded = 10;
      self.posts.skip += 50;
      self.paginate = false;
      $ionicScrollDelegate.scrollTop();
    };

    this.isSeller = $state.is('app.sell');

    this.noPosts = "User has no active posts.";

    this.noFeedback = "User has no feedback.";

    $scope.$on('$ionicView.afterEnter', function (event, viewData) {
      if ( document.getElementById("content-main") !== null ) {
        $ionicLoading.hide();
      }
    });
};
