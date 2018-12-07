import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('PostCtrl', PostCtrl);

function PostCtrl(
    $scope,
    $stateParams,
    $reactive,
    $cordovaToast,
    $ionicModal,
    $state,
    $rootScope,
    $ionicLoading,
    $ionicPopup,
    $cordovaDevice,
    $cordovaFile,
    $timeout,
    geolocation
  ) {
  $reactive(this).attach($scope);
  var self = this;

  this.subscribe('product', () => [ $stateParams.productId ], {
    onReady: function() { return; }
  });

  this.helpers({
    product: () => Products.findOne({ _id: $stateParams.productId }),
    profile: () => Profile.findOne({ profID: Meteor.userId() })
  });

  this.autorun( () => {
    this.sellerLocation = this.getReactively('profile.location.city') || this.getReactively('profile.location.region');
  });

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
      .then( function(coords){
        clearTimeout(timeout);
        Session.set('myCoordinates', coords);

        Meteor.call('getLocation', coords, function(err, location) {
          if (!err) {
            //Method is located at tapshop/lib/methods/profile.js
            Meteor.call('updateLocation', location, coords, function(err){
              if(!err){
                if (Meteor.isCordova) {
                  $cordovaToast.showShortBottom('Location Updated');
                } 
                else {
                  toastr.success('Location Updated');
                }
                $ionicLoading.hide();
                return;
              }
              else {
                if (Meteor.isCordova) {
                  $cordovaToast.showLongBottom('Error. Please try again.');
                } 
                else {
                  toastr.error('Error. Please try again.');
                }
                $ionicLoading.hide();
              }
            });
          }
          else {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } 
            else {
              toastr.error('Error. Please try again.');
            }
            $ionicLoading.hide();
          }
        });        
        return;
      },
      function(error){
        clearTimeout(timeout);
        console.log(error.message);
        
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Error. Please enable GPS.');
        } 
        else {
          toastr.error('Error. Please enable GPS.');
        }
        return;
      });
  }

  self.notes='';

  //Array variables for image upload and preview function.
  self.preview = [];
  self.uploads = [];
  self.imgSelect = [];
  $scope.newImg = '';
  self.uploadOption = null;

  self.isApp = Meteor.isCordova;

  if (Meteor.isCordova) {
    //If its a mobile app, ask if image is from camera or files.
    this.setOptions = function() {
      var optionsPopup = $ionicPopup.confirm({
        title: 'Add photos from:',
        scope: $scope,
        buttons: [{
          text: '<i class="fa fa-folder-o"></i> Files',
          type: 'button-stable',
          onTap: function() {
            self.uploadOption = 'Files';
            if ( self.isAndroid4 === true ){
              return self.addFile();
            } else {
              $timeout( function(){
                angular.element(document.querySelector('#addImg')).click();
                return;
              }, 680);
            }
          }
        },{
          text: '<i class="fa fa-camera"></i> Camera',
          type: 'button-stable',
          onTap: function() {
            self.uploadOption = 'Camera';
            return self.addCamera();
          }
        }]
      });
    };

    //Upload image from camera or files.
    this.addCamera = function() {
      if (self.uploads.length < 4 ) {
        MeteorCameraUI.getPictureNoUI({ quality: 100 }, function(error, data){
          if (data) {
            $scope.newImg = data;
            //Load image cropper.
            $scope.imgCrop.show();
            angular.element(document.querySelector('#newUpload')).on('load', function() {
              $('#newUpload').cropper({
                aspectRatio: 1/1,
                dragMode: 'move',
                rotatable: true,
                movable: true,
                responsive: false,
                toggleDragModeOnDblclick: false,
                minContainerHeight: 500,
                minCropBoxWidth: 50,
                minCropBoxHeight: 50,
                built: function(e) {
                  $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                },
                cropend: function(e) {
                  $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                }
              })
            });
          }
        });
      }
      else {
        $cordovaToast.showShortBottom('Too many uploads.');
      }
    };

    if ( $cordovaDevice.getPlatform() === "Android" /* && $cordovaDevice.getVersion().indexOf("4.4") === 0 */ ) {
      self.isAndroid4 = true;

      window.imagePicker.hasReadPermission( function(result) {
        if( result === false ){
          window.imagePicker.requestReadPermission();
        }
        else {
          return;
        }
      });

      //Upload image from file.
      this.addFile = function() {
        if (self.uploads.length < 4 ) {
          let options = {
            maximumImagesCount: 1,
            width: 1000,
            height: 1000,
            quality: 70
          };
          window.imagePicker.getPictures(
            function(files) {
              if ( files[0] ) {
                let file = files[0].substring( files[0].indexOf("cache/") + 6 );
                $cordovaFile.readAsDataURL(cordova.file.cacheDirectory, file)
                  .then( function(result){
                    $scope.newImg = result;
                    $scope.imgCrop.show();
                    angular.element(document.querySelector('#newUpload')).on('load', function() {
                      $('#newUpload').cropper({
                        aspectRatio: 1/1,
                        dragMode: 'move',
                        rotatable: true,
                        movable: true,
                        responsive: false,
                        toggleDragModeOnDblclick: false,
                        minContainerHeight: 500,
                        minCropBoxWidth: 50,
                        minCropBoxHeight: 50,
                        built: function(e) {
                          $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                        },
                        cropend: function(e) {
                          $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                        }
                      })
                    });
                  },
                  function(error){
                    $scope.newImg = '';
                  });
                }
                else {
                  $scope.newImg = '';
                }
            },
            function (error) {
              $scope.newImg = '';
            },
            options
          );
        }
        else {
          $cordovaToast.showShortBottom('Too many uploads.');
        }
      }
    } else {
      self.isAndroid4 = false;
    }
  }
  //Upload image on browser.
  this.addImg = function(files) {
    if (self.uploads.length < 4 ) {
      if (files[0]) {
        //Load image cropper.
        $scope.imgCrop.show();
        $scope.newImg = window.URL.createObjectURL(files[0]);
        angular.element(document.querySelector('#newUpload')).on('load', function() {
          $('#newUpload').cropper({
            aspectRatio: 1/1,
            dragMode: 'move',
            rotatable: true,
            movable: true,
            responsive: false,
            toggleDragModeOnDblclick: false,
            minContainerHeight: 500,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
            built: function(e) {
              $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
            },
            cropend: function(e) {
              $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
            }
          })
        })
      }
      else {
        $scope.newImg = '';
      }
    }
    else {
      if (Meteor.isCordova) {
        $cordovaToast.showShortBottom('Too many uploads.');
      } else {
        toastr.error('Too many uploads.');
      }
    }
  };

  //Rotate Image
  $scope.rotate = function() {
    $('#newUpload').cropper('rotate', 90);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  //Zoom Image
  $scope.zoomIn = function() {
    $('#newUpload').cropper('zoom', 0.1);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  $scope.zoomOut = function() {
    $('#newUpload').cropper('zoom', -0.1);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  //Save cropped image to array.
  $scope.uploadImg = function() {
    setTimeout(function(){ 
      $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
      
      if ($scope.croppedImg) {
        let saveUpload = MeteorCameraUI.dataURIToBlob($scope.croppedImg);

        self.preview.push($scope.croppedImg);
        self.uploads.push(saveUpload);

        $scope.newImg = '';
        $scope.croppedImg = '';
        $scope.imgCrop.hide();
        $('#newUpload').cropper('destroy');
      }
      else {
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Error. Please try again.');
        } else {
          toastr.error('Error. Please try again.');
        }
        $scope.newImg = '';
        $scope.croppedImg = '';
        $scope.imgCrop.hide();
        $('#newUpload').cropper('destroy');
      }
    },300);
  };

  //Cancel image upload.
  $scope.cancelImg = function() {
    $scope.imgCrop.hide();
    $scope.newImg = '';
    $scope.croppedImg = '';
    $('#newUpload').cropper('destroy');
  };

  //Image cropper canvas.
  $ionicModal.fromTemplateUrl('client/templates/sell/components/img_crop.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.imgCrop = modal;
  });

  //Function for selecting uploaded image.
  this.selectImg = function(select) {
    if ( self.imgSelect.length  === 0 ) {
      self.imgSelect.push(select);
    }
    else {
      let images = self.imgSelect;
      let selected = false;
      images.forEach(function(img){
        if (select === img) {
          let index = images.indexOf(select);
          images.splice(index, 1);
          return selected = true;
        }
      });
      if (selected === false) {
        images.push(select);
      }
      self.imgSelect = images;
    }
  };

  //Remove selected image.
  this.removeUpload = function() {
    for (let i = 0; i < self.imgSelect.length; i++) {
      self.preview.splice( self.imgSelect[i], 1 );
      self.uploads.splice( self.imgSelect[i], 1 );
    };
    self.imgSelect = [];
  };

  //Variables for form validation.
  $scope.noPrice = false;
  $scope.noLocation = false;
  $scope.noCond = false;
  $scope.noUpload = false;
  $scope.noTitle = false;

  //Upload new listing.
  this.submitPost = function() {
    let product = Products.findOne({_id: $stateParams.productId});
    //Form validation functions.
    if(
        !this.price ||
        !this.location ||
        isNaN( this.price.replace(/,/g, '') ) === true ||
        self.uploads.length === 0 ||
        !this.listingTitle
    ){
      console.log("Please fill-up all required items.")
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Please fill-up all required items.');
      } else {
        toastr.error('Please fill-up all required items.');
      }
      if ( !this.price || isNaN( this.price.replace(/,/g, '') ) === true ) { $scope.noPrice = true; } else { $scope.noPrice = false; }
      if (!this.location) { $scope.noLocation = true; } else { $scope.noLocation = false; }
      if ( !this.listingTitle ) { $scope.noTitle = true; } else { $scope.noTitle = false; }
      if ( self.uploads.length === 0 ) { $scope.noUpload = true; } else { $scope.noUpload = false; }
    }
    else {
      $rootScope.$broadcast('loadspinner');

      let uploads = self.uploads;

      //Save form data to object.
      var newListing = {
        productID: product._id,
        title: this.listingTitle,
        sellPrice: parseInt( this.price.replace(/,/g, '') ),
        condition: "New",
        meetLocation: this.location.toString(),
        listingNotes: self.notes.toString().replace(/(?:\r\n|\r|\n)/g, '<br />')
      };
      //Insert to form data to database.
      //Method is located at tapshop/server/methods/listings_server.js
      Meteor.call('postListing', newListing, function(err, posted) {
        if (!err) {
          let uploadCount = 0;
          let meta = {
            listID: posted
          }
          //Upload images to database.
          self.uploads.forEach( function(imgFile) {
            let filename = newListing.title + uploadCount.toString();
            let fileData = self.newFile( imgFile, filename );

            var uploadInstance = Uploads.insert({
              file: fileData,
              meta: meta,
              streams: 'dynamic',
              chunkSize: 'dynamic'
            }, false);

            uploadInstance.on('end', function(error, fileObj) {
              if (!error) {
                //Method is located at tapshop/server/methods/listings_server.js
                Meteor.call('insertImage', posted, fileObj._id, function(err){
                  if (!err){
                    uploadCount++;
                    if (uploadCount === self.uploads.length) {
                      //Insert test data. Please remove when deploying for production.
                      $state.go('app.sell');
                    } else {
                      return;
                    }
                  }
                  else {
                    console.log("Upload Error");
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
              else {
                console.log("Upload Error");
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
          });
        }
        else {
          $ionicLoading.hide();
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } else {
            toastr.error('Error. Please try again.');
          }
        }
      });
    }
  };

  this.newFile = function(blob, name){
    let filename = '';
    if (blob.type === "image/jpeg") {
      filename = name + '.jpg';
    } else if (blob.type === "image/png") {
      filename = name + '.png';
    } else if (blob.type === "image/gif") {
      filename = name + '.gif';
    } else {
      throw error;
    }
    let newFile = _.extend(blob,{
      name: filename
    })
    return newFile;
  }

  //Cancel new listing.
  this.cancel = function() {
    $scope.imgCrop.remove();
    $state.go('app.select');
  };

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    $ionicLoading.hide();
  });

  $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    $scope.imgCrop.remove();
    $('#newUpload').cropper('destroy');
  });
};
