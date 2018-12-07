import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

angular
    .module('salephone')
    .controller('ForgotPwdCtrl', ForgotPwdCtrl);

 function ForgotPwdCtrl ($scope, $reactive, $state, $ionicLoading, $stateParams, $rootScope, $ionicHistory) {
    $reactive(this).attach($scope);
    var self = this;

    if( $state.is('app.forgot') ){
      //Send password to email.
      this.resetPass = function() {
        let regex = new RegExp(/.+@(.+){2,}\.(.+){2,}/);

        if ( regex.test(self.email) === true ) {
          $rootScope.$broadcast('loadspinner');

          //Method is located at tapshop/server/methods/profile_server.js
          Meteor.call('resetPwd', self.email, function(err){
            if (!err){
              if (Meteor.isCordova) {
                $cordovaToast.showShortBottom('Email Sent');
              } else {
                toastr.success('Email Sent');
              }
              $ionicLoading.hide();
            }
            else if (err.error === 'Not Registered') {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Email is not registered.');
              } else {
                toastr.error('Email is not registered.');
              }
              $ionicLoading.hide();
            }
            else {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              $ionicLoading.hide();
            }
          });
        }
        else if ( regex.test(self.email) === false ) {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Invalid email address.');
          } else {
            toastr.error('Invalid email address.');
          }
        } else { return; }
      }
    }
    else if( $state.is('app.reset') && $stateParams.token ) {
      //Change password through token sent in email.
      this.changePass = function() {
        if( self.password.length >= 6 ) {
          $rootScope.$broadcast('loadspinner');
          if ( self.password === self.confirm ) {
            Accounts.resetPassword($stateParams.token, self.password, function(err){
              if(!err) {
                if (Meteor.isCordova) {
                  $cordovaToast.showShortBottom('Password Changed');
                } else {
                  toastr.success('Password Changed');
                }
                $state.go('app.shop');
                }
              else {
                if(err.error === 403) {
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Reset link expired.');
                  } else {
                    toastr.error('Reset link expired.');
                  }
                }
                else {
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Error. Please try again.');
                  } else {
                    toastr.error('Error. Please try again.');
                  }
                }
                $ionicLoading.hide();
              }
            });
          }
          else {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Passwords do not match.');
            } else {
              toastr.error('Passwords do not match.');
            }
            $ionicLoading.hide();
          }
        } else if ( self.password.length < 6 ) {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Password should contain at least 6 characters.');
          } else {
            toastr.error('Password should contain at least 6 characters.');
          }
        }
        else { return; }
      }
    }
    else {
      $state.go('app.login')
    }

    $scope.$on('$ionicView.afterEnter', function () {
        $ionicLoading.hide();
    });
 };
