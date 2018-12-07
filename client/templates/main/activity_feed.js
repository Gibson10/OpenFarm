import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('FeedsCtrl', FeedsCtrl);

 function FeedsCtrl ($scope, $reactive, $state, $sce, $ionicLoading, $timeout) {
    $reactive(this).attach($scope);
    var self = this;

    //Infinite scroll variable.
    self.loaded = 15;

    //Array for unread activity feed.
    self.unread = [];

    this.subscribe('activities', () => [ self.getReactively('loaded') ], {
        onReady: function() {
          if ( self.newfeeds.length > 0 ) {
            for (let i = 0; i < self.newfeeds.length; i++) {
              self.unread.push( self.newfeeds[i]._id );
            }
            //Method is located at tapshop/lib/methods/feed.js
            Meteor.call('feedRead');
          }
          $ionicLoading.hide();
        }
    });

    this.helpers({
      feeds: () => Feeds.find({}, { limit: self.getReactively('loaded'),sort: { postDate: -1 } }),
      newfeeds: () => Feeds.find({ read: false })
    });

    //Get count of all activity feeds in the server.
    //Method is located at tapshop/lib/methods/app_methods.js
    Meteor.call('allFeeds', function(err, count) {
        self.allfeeds = count;
    });

    //Get Activity Feed and render as HTML.
    this.feedmsg = function(id) {
        return $sce.trustAsHtml( Feeds.findOne({ _id: id }).body );
    }

    //Classify each activty feed as unread and read.
    this.isRead = function(id) {
        if ( self.unread.length != 0 ) {
            for ( i = 0; i < self.unread.length; i++ ) {
                if (self.unread[i] === id ) {
                    return false;
                }
            }   return true;
        } else {
            return true;
        }
    }

    //Go to page based on activity feed message.
    this.go = function(id) {
      let thisFeed = Feeds.findOne({ _id: id });

      if ( thisFeed.linkType === 'product' ) {
        if( Listings.findOne({ _id: thisFeed.linkID, active: true }) ) {
          $state.go('app.product', { listingId: thisFeed.linkID });
        }
        else {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Post is not active.');
          } else {
            toastr.error('Post is not active.');
          }
          return;
        }
      }
      else if ( thisFeed.linkType === 'mypost' ) {
        if( Listings.findOne({ _id: thisFeed.linkID, active: true }) ) {
          $state.go('app.myproduct', { listingId: thisFeed.linkID });
        }
        else {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Post is not active.');
          } else {
            toastr.error('Post is not active.');
          }
          return;
        }
      }
      else if ( thisFeed.linkType === 'profile' ) {
        $state.go('app.myprofile', { profileId: thisFeed.linkID });
      }
      else {
        return;
      }
    }

    this.noPosts = "No activities to show.";

    //Refresher functions.
    $scope.refresh = function() {
      $state.reload('app.feeds');
      $scope.$broadcast('scroll.refreshComplete');
    };

    //Infinite scroll functions.
    $scope.loadMore = function() {
      $timeout( function(){
        self.loaded += 5;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, 2000);
    };

    $scope.$on('$ionicView.afterEnter', function () {
      if ( document.getElementById("content-main") !== null ) {
        $ionicLoading.hide();
      }
    });
};
