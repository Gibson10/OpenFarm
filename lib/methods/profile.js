import { Meteor } from 'meteor/meteor';

Meteor.methods({

  //Change uploaded profile image for user.
  'updateProfImg': function(imgId) {
    check(this.userId, String);
    check(imgId, String);
    let thisProf = Profile.findOne({ profID: this.userId });

    ProfileImg.collection.update({
      _id: imgId
    },{
      $set:{
        'meta.userId': this.userId
      }
    });

    return Profile.update({
      _id: thisProf._id,
      profID: this.userId
    },{
      $set: {
        profImageID: imgId
      }
    });
  },

  //Remove profile image of user.
  'removeImage': function(imgId) {
    check(this.userId, String);
    check(imgId, String);

    let thisProf = Profile.findOne({ profID: this.userId });
    let profImgURL = "/images/users/profile_default.png";

    if ( ProfileImg.findOne({ _id: imgId, 'meta.userId': this.userId }) ) {
        ProfileImg.remove({ _id: imgId, 'meta.userId': this.userId });
    }

    return Profile.update({
      _id: thisProf._id,
      profID: this.userId
    },{
      $set: {
        profImage: profImgURL,
        profImageID: null
      }
    });
  },

  //Update location details of user.
  'updateLocation': function(location, coordinates) {
    check(this.userId, String);
    check(location, Match.OneOf(null,{
      city: String,
      region: String,
      country: String,
      countryCode: String
      })
    );
    check(coordinates, Match.OneOf(null,{
        lat: Number,
        lng: Number
      })
    );

    let hasCoords = true;

    if (coordinates === null){
      coordinates.lng = 0;
      coordinates.lat = 0;
      hasCoords = false;
    }

    let profile = Profile.findOne({ profID: Meteor.userId() });

    return Profile.update({
      _id: profile._id,
      profID: Meteor.userId()
    },{
      $set: {
        hasLocation: hasCoords,
        location: {
          type: 'Point',
          coordinates: [ coordinates.lng, coordinates.lat ],
          city: location.city,
          region: location.region,
          country: location.country,
          countryCode: location.countryCode
        }
      }
    });
  }
});
