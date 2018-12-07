import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http'

// Fixture data
Meteor.startup(function(){
  if (Listings.find({ isTest: true }).count() === 0 && Profile.find({ isTest: true }).count() === 0) {
    Meteor.call('initSeed', function(err){
      if(!err){
        let url = Meteor.absoluteUrl();
        HTTP.get(url,
        function(err, result){
          if (!err){
            Meteor.call('seedImages', function(){ //Insert test data images. Please remove on production.
              if(!err){
                console.log('Test data complete.');
              } else {
                console.log('Error inserting test data: ' + err);
              }
            });
          }
          else {
            console.log('Error connecting to server: ' + err);
          }
        });
      } else {
        console.log('Error inserting test data: ' + err);
      }
    });
  }
});
