import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'

angular
    .module('salephone')
    .controller('AuthCtrl', AuthCtrl);

 function AuthCtrl ($scope, $reactive, $state, $ionicLoading, $ionicHistory, $rootScope, $cordovaToast) {
    $reactive(this).attach($scope);
    var self = this;

    //Method is located at tapshop/server/methods/profile_server.js
    Meteor.call('hasPassword', function(err, result){
      if ( err || result === false ){
        $ionicHistory.goBack();
      }
    });

    //Change password through token sent in email.
    this.changePass = function() {
        $rootScope.$broadcast('loadspinner');

        let passwordRegex = new RegExp(/^\S{6,}$/);

        if ( 
          self.oldPassword && 
          self.oldPassword !== self.password &&
          self.password && 
          passwordRegex.test(self.password) === true && 
          self.password === self.confirm 
        ) {
          Accounts.changePassword(self.oldPassword, self.password, function(err){
            if(err){
              $ionicLoading.hide();
              if ( err.error === 403 ){
                if (Meteor.isCordova) {
                  $cordovaToast.showLongBottom('Current password is invalid.');
                } else {
                  toastr.error('Current password is invalid.');
                }
                return;
              }
              else {
                if (Meteor.isCordova) {
                  $cordovaToast.showLongBottom('Error. Please try again.');
                } else {
                  toastr.error('Error. Please try again.');
                }
                return;
              }
            }
            else{
              self.oldPassword = '';
              self.password = '';
              self.confirm = '';
              if (Meteor.isCordova) {
                $cordovaToast.showShortBottom('Password Changed');
              } else {
                toastr.success('Password Changed');
              }
              Meteor.logoutOtherClients();
              $ionicLoading.hide();
              $ionicHistory.goBack();
            }
          })
        }
        else {
          $ionicLoading.hide();
          if( !self.oldPassword ){
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Please enter current password.');
            } else {
              toastr.error('Please enter current password.');
            }
            return;
          }
          else if( self.oldPassword === self.password ){
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('New password must not be the same.');
            } else {
              toastr.error('New password must not be the same.');
            }
            return;
          }
          else if ( !self.password || passwordRegex.test(self.password) === false ){
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Password must have minimum of 6 characters.');
            } else {
              toastr.error('Password must have minimum of 6characters.');
            }
            return;
          }
          else if (self.password !== self.confirm){
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Passwords do not match.');
            } else {
              toastr.error('Passwords do not match.');
            }
            return;
          }
          return;
        }
    }

    $scope.$on('$ionicView.afterEnter', function () {
        $ionicLoading.hide();
    });
 };
