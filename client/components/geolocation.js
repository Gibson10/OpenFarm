import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .factory('geolocation', geolocation);

function geolocation ($q, $window) {
    let getCurrentPosition = function () {
        var deferred = $q.defer();
        
        if( Meteor.isCordova ){
            navigator.geolocation.getCurrentPosition(
                function (result) {
                    if( !result.coords || !result.coords.latitude || !result.coords.longitude){
                        deferred.reject('No coordinates data available.');
                    }
                    else{
                        
                        let mobileLatlng = {
                            lat: result.coords.latitude,
                            lng: result.coords.longitude
                        }

                        window.localStorage.setItem('lat', result.coords.latitude);
                        window.localStorage.setItem('lng', result.coords.longitude);                        
                        
                        deferred.resolve(mobileLatlng);
                    }
                },
                function (err) {
                    deferred.reject(err);
                },{
                    enableHighAccuracy: true
                });            
        }
        else {
            if (!$window.navigator.geolocation) {
                deferred.reject('GPS not supported.');
            } 
            else {
                $window.navigator.geolocation.getCurrentPosition(
                    function (result) {

                        let latlng = {
                            lat: result.coords.latitude,
                            lng: result.coords.longitude
                        }

                        window.localStorage.setItem('lat', result.coords.latitude);
                        window.localStorage.setItem('lng', result.coords.longitude);

                        deferred.resolve(latlng);
                    },
                    function (err) {
                        deferred.reject(err);
                    },{
                        enableHighAccuracy: true
                    });
            }
        }
        return deferred.promise;  
      
    }
    return {
        getCurrentPosition: getCurrentPosition
    }
};
