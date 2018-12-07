import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('myProfCtrl', myProfCtrl);

function myProfCtrl (
                      $scope,
                      $rootScope,
                      $reactive,
                      $ionicViewSwitcher,
                      $state,
                      $sce,
                      $ionicLoading,
                      $timeout,
                      $ionicHistory,
                      $ionicPlatform
                    ){
  $reactive(this).attach($scope);
  var self = this;

  //Variables for infinite scroll functions of user feedback.
  self.loaded = 10;
  self.limit = self.loaded;

  this.subscribe('myProfile', () => [], {
    onReady: function() {
      $ionicLoading.hide();
      return;
    }
  });

  this.subscribe('myFeedback', () => [ self.getReactively('loaded') ], {
      onReady: function() {
        self.limit = self.loaded;
        return;
      }
  });

  this.helpers({
      profile: () => Profile.findOne({ profID: Meteor.userId() }),
      feedback: () => Feedback.find({
          user: Meteor.userId()
        },{
          sort: { postDate: -1 },
          limit: self.getReactively('limit')
        }),
        profileImg: () => ProfileImg.findOne({ 'meta.userId': Meteor.userId() })
  });

  //Get count of all user feedback in server.
  Meteor.call('allFeedback', Profile.findOne({ profID: Meteor.userId() })._id, function(err, count) {
      self.allfeedback = count;
  });

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

  //Get feedback data and render as HTML.
  this.review = function(id) {
    if ( Feedback.findOne({ _id: id }) ) {
      return $sce.trustAsHtml( Feedback.findOne({ _id: id }).body );
    } else {
      return;
    }
  };

  //Get data on user that posted the feedback.
  this.feedbackBy = function(userId) {
    return Profile.findOne({ profID: userId });
  };

  //Get profile image of user that posted feedback.
  this.postbyImg = function(userId) {
    return ProfileImg.findOne({ 'meta.userId': userId });
  };

  //Refresher functions.
  $scope.refresh = function() {
    $state.reload('app.myprofile');
    $scope.$broadcast('scroll.refreshComplete');
  };

  //Infinite scroll functions.
  $scope.loadMore = function() {
    $timeout( function(){
        self.loaded += 5;
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }, 2000);
  };

  this.noFeedback = "You have no feedback."

  $ionicPlatform.onHardwareBackButton( function(){
    $ionicViewSwitcher.nextDirection("back");
    $state.go('app.shop');
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
  });
};
