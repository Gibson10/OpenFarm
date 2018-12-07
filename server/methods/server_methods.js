import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
        //Get user's location based on geolocation data.
        'getLocation': function(location) {
          check(location, Match.OneOf(null,{
              lat: Number,
              lng: Number
            })
          )

          if( !Meteor.settings.here.appId || !Meteor.settings.here.appCode ){
            if( Meteor.isDevelopment ){
              console.log('Please get your HERE Maps API key to get location.')
            }
            return;
          }

          if ( location !== null ) {
            const settings = {
              geocoderProvider: "here",
              httpAdapter: "http",
              app: {
                appId: Meteor.settings.here.appId,
                appCode: Meteor.settings.here.appCode
              }
            };
            const geocoder = require('node-geocoder')(settings.geocoderProvider, settings.httpAdapter, settings.app);
            return geocoder.reverse({ lat: location.lat, lon: location.lng })
            .then( function(res) {
              return {
                city: res[0].city,
                region: res[0].state || res[0].county || res[0].district,
                country: res[0].country,
                countryCode: res[0].countryCode
              }
            });
          }
          else {
            return;
          }
        }

});
