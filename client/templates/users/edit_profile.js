import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('EditProfCtrl', EditProfCtrl);

function EditProfCtrl (
                        $scope,
                        $reactive,
                        $timeout,
                        $cordovaToast,
                        $state,
                        $http,
                        $ionicPopup,
                        $rootScope,
                        $ionicLoading,
                        $cordovaDevice,
                        $cordovaFile,
                        geolocation
                      ) {

  $reactive(this).attach($scope);
  $scope.mylocation = null;
  var self = this;

  this.subscribe('myProfile', () => [], {
    onReady: function() {
      $ionicLoading.hide();
      return;
    }
  });

  this.autorun( () => {
    if( Meteor.user() ){
      this.email = Meteor.user().emails[0].address
    }
  });

  //Check if user has password, or has logged-in using Oauth.
  //Method is located at tapshop/server/methods/profile_server.js
  Meteor.call('hasPassword', function(err, result){
    if ( !err && result === true ){
      $scope.hasPassword = true;
    }
    else {
      $scope.hasPassword = false;
    }
  });

  //Variables for image upload.
  this.upload = null;
  this.preview = null;
  this.imgremove = null;
  this.disabled = false;

  this.helpers({
    profile: () => Profile.findOne({ profID: Meteor.userId() }),
    profileImg: () => ProfileImg.findOne({ 'meta.userId': Meteor.userId() }),
    hasUpload() {
      if ( self.getReactively('profileImg') && !self.getReactively('imgremove') ) {
        return true;
      }
      else {
        return false;
      }
    }
  });

  if ( Meteor.isCordova && $cordovaDevice.getPlatform() === "Android" && $cordovaDevice.getVersion().indexOf("4.4") === 0 ) {
    self.isAndroid4 = true;

    window.imagePicker.hasReadPermission( function(result) {
      if( result === false ){
        window.imagePicker.requestReadPermission();
      }
      else {
        return;
      }
    });

    //Save uploaded image on Android 4.4.
    this.addFile = function() {
      $rootScope.$broadcast('loadspinner');
      let options = {
        maximumImagesCount: 1,
        width: 80,
        height: 80,
        quality: 100
      };
      window.imagePicker.getPictures(
        function(files) {
          if ( files[0] ) {
            let file = files[0].substring( files[0].indexOf("cache/") + 6 );
            $cordovaFile.readAsDataURL(cordova.file.cacheDirectory, file)
              .then( function(result){
                self.preview = result;
                self.upload = MeteorCameraUI.dataURIToBlob(result);
                $ionicLoading.hide();
                return;
              },
              function(error){
                $cordovaToast.showLongBottom('Error. Please try again.');
                $ionicLoading.hide();
                return;
              });
          }
          else {
            $ionicLoading.hide();
            return;
          }
        },
        function (error) {
          $cordovaToast.showLongBottom('Error. Please try again.');
          $ionicLoading.hide();
          return;
        },
        options
      );
    }
  }
  else {
    self.isAndroid4 = false;
  }

  //Save uploaded image.
  this.uploadImg = function(files) {
    if ( files.length != 0 ) {
      $rootScope.$broadcast('loadspinner');
      let imgUrl = window.URL.createObjectURL(files[0]);

      this.resizeImage(imgUrl, function(result){
        self.preview = result;
        self.upload = MeteorCameraUI.dataURIToBlob(result);
        $ionicLoading.hide();
      });
    }
  };


  //Remove current profile image.
  this.removeImg = function() {
    if ( this.upload != null ) {
      this.upload = null;
      this.preview = null;
      return;
    }
    else if ( self.profileImg && this.imgremove === null ) {
      this.imgremove = self.profileImg._id;
      this.preview = "/images/users/profile_default.png";
      return;
    }
  };

  //Get location data of user using Geolocaiton.
  this.getLocation = function() {
    $rootScope.$broadcast('loadspinner');
      
    let timeout = setTimeout( function(){ 
      $ionicLoading.hide();
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Request Timeout. Please try again.');
      } 
      else {
        toastr.error('Request Timeout. Please try again.');
      }
    }, 15000);

    geolocation.getCurrentPosition()
      .then( function(geodata){
        clearTimeout(timeout);
        //Method is located at tapshop/server/methods/server_methods.js
        Meteor.call('getLocation', geodata, function(err, geoloc) {
          if ( !err ) {
            console.log(geoloc);
            self.profile.location.coordinates = [geodata.lng, geodata.lat];
            self.profile.hasLocation = true;
            self.profile.location.city = geoloc.city;
            self.profile.location.region = geoloc.region;
            self.profile.location.country = geoloc.country;
            self.profile.location.countryCode = geoloc.countryCode;

            if ( !geoloc.city || !geoloc.region ) {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              $ionicLoading.hide();
            }
            else {
              if (Meteor.isCordova) {
                $cordovaToast.showShortBottom('Location Updated');
              } else {
                toastr.success('Location Updated');
              }
              $ionicLoading.hide();
            }
          }
          else {
            console.log( "Error getting geolocation, please try again later." );
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            $ionicLoading.hide();
            return null;
          }
        });      
      },
      function(error){
        setTimeout( function(){ 
          $ionicLoading.hide();
        },100);
        clearTimeout(timeout);   
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Error. Please enable GPS.');
        } else {
          toastr.error('Error. Please enable GPS.');
        }
        return;
      });
  };

  $scope.noName = false;

  //Save profile changes in database.
  this.update = function() {
    if ( !self.profile.profName ) {
      $scope.noName = true;
      console.log("Please fill-up username.");
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Username is required.');
      } else {
        toastr.error('Username is required.');
      }
      return;
    }
    else {
      $scope.noName = false;
      $rootScope.$broadcast('loadspinner');
      let profile = self.profile;

      if ( this.imgremove !== null ) {
        //Method is located at tapshop/lib/methods/profile.js
        Meteor.call('removeImage', this.imgremove, function(err) {
          if (err) {
            console.log('Error removing image.');
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            $ionicLoading.hide();
            return;
          }
        });
      }

      //Save and upload changes to user profile.
      //Method is located at tapshop/server/methods/profile_server.js
      Meteor.call('checkName', self.profile.profName, function(err, result){
        if ( !err && result === true ) {
          let newProfile = {
              username: self.profile.profName,
              hasLocation: self.profile.hasLocation,
              coordinates: self.profile.location.coordinates,
              city: self.profile.location.city,
              region: self.profile.location.region,
              country: self.profile.location.country,
              countryCode: self.profile.location.countryCode,
          }
          //Method is located at tapshop/server/methods/profile_server.js
          Meteor.call('updateProfile', Meteor.userId(), newProfile, function(err) {
            if (!err) {
              if ( self.upload !== null ) {
                let uploadFile = self.newFile(self.upload);

                if ( self.profileImg ) {
                  //Remove profile image selected for removal from database.
                  //Method is located at tapshop/lib/methods/profile.js
                  Meteor.call('removeImage', self.profileImg._id, function(err) {
                    if (!err) {
                      var uploadInstance = ProfileImg.insert({
                        file: uploadFile,
                        streams: 'dynamic',
                        chunkSize: 'dynamic'
                      }, false);

                      uploadInstance.on('end', function(error, fileObj) {
                        if (!error) {
                          //Method is located at tapshop/lib/methods/profile.js
                          Meteor.call('updateProfImg', fileObj._id, function(err){
                            if(!err){
                              if (Meteor.isCordova) {
                                $cordovaToast.showShortBottom('Profile Updated');
                              } else {
                                toastr.success('Profile Updated');
                              }
                              $state.go('app.myprofile');
                            }
                            else {
                              console.log(err);
                              if (Meteor.isCordova) {
                                $cordovaToast.showLongBottom('Error. Please try again.');
                              } else {
                                toastr.error('Error. Please try again.');
                              }
                              $ionicLoading.hide();
                              return;
                            }
                          });
                        }
                        else {
                          console.log(err);
                          if (Meteor.isCordova) {
                            $cordovaToast.showLongBottom('Error. Please try again.');
                          } else {
                            toastr.error('Error. Please try again.');
                          }
                          $ionicLoading.hide();
                          return;
                        }
                      });
                      uploadInstance.start();
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
                  });
                }
                else {
                  //Upload new image to database.
                  var uploadInstance = ProfileImg.insert({
                    file: uploadFile,
                    streams: 'dynamic',
                    chunkSize: 'dynamic'
                  }, false);

                  uploadInstance.on('end', function(error, fileObj) {
                    if (!error) {
                      //Method is located at tapshop/lib/methods/profile.js
                      Meteor.call('updateProfImg', fileObj._id, function(err){
                        if(!err){
                          if (Meteor.isCordova) {
                            $cordovaToast.showShortBottom('Profile Updated');
                          } else {
                            toastr.success('Profile Updated');
                          }
                          $state.go('app.myprofile');
                        }
                        else {
                          console.log(err);
                          if (Meteor.isCordova) {
                            $cordovaToast.showLongBottom('Error. Please try again.');
                          } else {
                            toastr.error('Error. Please try again.');
                          }
                          $ionicLoading.hide();
                          return;
                        }
                      });
                    }
                    else {
                      console.log(err);
                      if (Meteor.isCordova) {
                        $cordovaToast.showLongBottom('Error. Please try again.');
                      } else {
                        toastr.error('Error. Please try again.');
                      }
                      $ionicLoading.hide();
                      return;
                    }
                  });
                  uploadInstance.start();
                }
              }
              else {
                if (Meteor.isCordova) {
                  $cordovaToast.showShortBottom('Profile Updated');
                } else {
                  toastr.success('Profile Updated');
                }
                $state.go('app.myprofile');
              }
            }
            else {
              console.log("Update error, please try again.");
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              $ionicLoading.hide();
              return;
            }
          })
        }
        else if ( result === false ){
          $scope.noName = true;
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('New username already exists.');
          } else {
            toastr.error('New username already exists.');
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
  };

  //Logout the user.
  this.logout = function() {
      $rootScope.$broadcast('loadspinner');
      Meteor.logout(function(err) {
          if (!err) {
              $ionicLoading.hide();
              $state.go('app.shop');
          } else {
              $ionicLoading.hide();
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              return
          }
      });
  };

  this.resizeImage = function(url, callback){
    var sourceImage = new Image();

    sourceImage.onload = function() {
       var canvas = document.createElement("canvas");
       canvas.width = 80;
       canvas.height = 80;
       canvas.class = "edit-profileimg";
       canvas.getContext("2d").drawImage(sourceImage, 0, 0, 80, 80);
       callback(canvas.toDataURL());
    }
   sourceImage.src = url;
  }

  this.newFile = function(blob){
    let filename = self.profile.profName + '.png';
    let newFile = _.extend(blob,{
      name: filename
    })
    return newFile;
  }

  $scope.$on('$ionicView.beforeLeave', function () {
    this.upload = null;
    this.preview = null;
    this.imgremove = null;
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
  });
};
