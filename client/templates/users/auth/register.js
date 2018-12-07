import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'
import { Session } from 'meteor/session';

angular
    .module('salephone')
    .controller('RegCtrl', RegCtrl);

 function RegCtrl (
                    $scope,
                    $reactive,
                    $http,
                    $state,
                    $cordovaToast,
                    $ionicLoading,
                    $rootScope,
                    $ionicPopup
                  ){
  $reactive(this).attach($scope);
  var self = this;

  this.pwdMismatch = false;
  this.invalidEmail = false;
  this.invalidUser = false;
  this.invalidPass = false;
  this.userExists = false;
  this.emailExists = false;
  this.noEmail = false;
  this.noUser = false;
  this.noPass = false;
  this.noConfirm = false;
  this.submitted = 0;

  this.clearPass = function(){
    this.pwdMismatch = false;
    this.invalidPass = false;
    this.noPass = false;
    this.noConfirm = false;
  }

  this.clearEmail = function(){
    this.emailExists = false;
    this.noEmail = false;
    this.invalidEmail = false;    
  }

  this.clearUser = function(){
    this.noUser = false;
    this.invalidUser = false;
    this.userExists = false;    
  }

  this.register = function(){
    $rootScope.$broadcast('loadspinner');

    if( Meteor.status().connected === false ){
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Connection error.');
      } 
      else {
        toastr.error('Connection error.');
      }
      $ionicLoading.hide();
      return;
    }

    let emailRegex = new RegExp(/.+@(.+){2,}\.(.+){2,}/);
    let usernameRegex = new RegExp(/^\S{4,}$/);
    let passwordRegex = new RegExp(/^\S{6,}$/);

    if (
      self.username &&
      self.email &&
      emailRegex.test(self.email) === true &&
      usernameRegex.test(self.username) === true &&
      passwordRegex.test(self.password) === true &&
      self.password &&
      self.password === self.confirm
    ){

      Meteor.call('checkUser', self.email, self.username, function(err){
        if(err){
          console.log(err);
          if ( err.error === 'Username Exists' ){
            self.userExists = true;
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Username exists.');
            } else {
              toastr.error('Username exists.');
            }
            $ionicLoading.hide();
            return;
          }
          else if ( err.error === 'Email Exists' ) {
            self.emailExists = true;
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Email is already registered.');
            } else {
              toastr.error('Email is already registered.');
            }

            $ionicLoading.hide();
            return;
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
        }
        else {
		  self.submitted++;	
			
          Accounts.createUser({
            email: self.email,
            username: self.username,
            password: self.password
          },
          function(err){
            if(err){
              if( self.submitted > 1 && err.error === 403 ){
                return;
              }
              else{
                console.log(err);
                self.submitted = 0;
                $ionicLoading.hide();
                return;
              }
            }
            else{
              return self.createProfile();
            }
          });
        }
      });
    }
    else {
      if( !self.username ) { self.noUser = true; }
      if( !self.password ) { self.noPass = true; }
      if( !self.confirm ) { self.noConfirm = true; }
      if( !self.email ) { self.noEmail = true; }
      if ( self.username && usernameRegex.test(self.username) === false ) { this.invalidUser = true; }
      if ( self.password && passwordRegex.test(self.password) === false ) { this.invalidPass = true; }
      if ( ( self.password || self.confirm ) && self.password !== self.confirm ) { this.pwdMismatch = true; }
      if ( self.email && emailRegex.test(self.email) === false ) { this.invalidEmail = true; }
      $ionicLoading.hide();
      return;
    }
  };  

  this.isMobileBrowser = function(){
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  } 

  //Oauth login with Facebook.
  this.loginFB = function() {
    let style = self.isMobileBrowser() ? "redirect" : "popup";
    let redirect = self.isMobileBrowser() ? 'app/login' : '_oauth/facebook';

    Meteor.loginWithFacebook({
      requestPermissions: ['email', 'public_profile'],
      redirectUrl: Meteor.absoluteUrl(redirect),
      loginStyle: style
    }, function(err){
        if(err){
          if( err.error === 'Email exists.' ) {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Account is not verified. Please check your email on how to verify your account.');
            } else {
              toastr.error('Account is not verified. Please check your email on how to verify your account.');
            }
          }
          $state.reload('app.register');
          return;
        }
        else{
          return self.checkUser();
        }
    });
  };

  //Oauth login with Google.
  this.loginGoogle = function() {
      let style = self.isMobileBrowser() ? "redirect" : "popup";
      let redirect = self.isMobileBrowser() ? 'app/login' : '_oauth/google';

      Meteor.loginWithGoogle({
        requestPermissions: ['email', 'profile'],
        redirectUrl: Meteor.absoluteUrl(redirect),
        loginStyle: style
      }, function(err){
          if(err){
            if( err.error === 'Email exists.' ) {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Account is not verified. Please check your email on how to verify your account.');
              } else {
                toastr.error('Account is not verified. Please check your email on how to verify your account.');
              }
            }
            $state.reload('app.register');
            return;
          }
          else{
            return self.checkUser();
          }
      });
  };

  this.checkUser = function(){
    $rootScope.$broadcast('loadspinner');
    //Check if user is already registered.
    //Method is located at tapshop/server/methods/profile_server.js
    Meteor.call('isRegistered', function(err, registered){
      if ( registered === false ) {
        self.createProfile();
      }
      else if ( registered === true ) {
        $state.go('app.shop');
      }
      else {
        $ionicLoading.hide();
        Meteor.logout(function() {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } 
          else {
            toastr.error('Error. Please try again.');
          }
		      self.submitted = 0;
          $state.reload('app.register');
        });
      }
    });
  };

  this.createProfile = function(){
        //Get user location using geolocation data.
        //Method is located at tapshop/server/methods/server_methods.js
        let newProfile = {
          hasLocation: false,
          location: {
            type: 'Point',
            coordinates: [0,0],
            city: null,
            region: null,
            country: null,
            countryCode: null
          }
        }
        self.currentLoc = Session.get('myCoordinates');

        if ( self.currentLoc ) {
          newProfile.location.coordinates = [ self.currentLoc.lng, self.currentLoc.lat ];
          newProfile.hasLocation = true;

          Meteor.call('getLocation', self.currentLoc, function(err, loc) {
            if ( loc ) {
              newProfile.location.city = loc.city,
              newProfile.location.region = loc.region,
              newProfile.location.country = loc.country,
              newProfile.location.countryCode = loc.countryCode

              //Create separate user profile for public.
              return self.insertProfile(newProfile);
            }
            else {
              console.log( "Error getting location." );
              return self.insertProfile(newProfile);
            }
          });
        }
        else {
          return self.insertProfile(newProfile);
        }
    }

    this.insertProfile = function(newProfile) {
      //Create separate user profile for public.
      //Method is located at tapshop/server/methods/profile_server.js
      Meteor.call('uploadProfile', newProfile, function(err, profile){
        if (!err) {
			    Meteor.call('sendVerifyEmail', Meteor.userId(), function(err){
				    if (Meteor.isCordova) {
            		$cordovaToast.showShortBottom('Account Registered');
          	} 
            else {
            	toastr.success('Account Registered');
          	}
          	$state.go('app.shop');
			    });
        }
        else {
          $ionicLoading.hide();
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } else {
            toastr.error('Error. Please try again.');
          }
		      self.submitted = 0;
          //Method is located at tapshop/server/methods/profile_server.js
          Meteor.call('signupError', function(err){
            Meteor.logout(function() {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              $state.reload('app.register');
            });
          })
        }
      });
    };

    $scope.$on('$ionicView.afterEnter', function () {
        $ionicLoading.hide();
    });
 };
