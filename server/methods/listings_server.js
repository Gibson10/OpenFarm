import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
  //Upload new listing.  Update listing count.
  'postListing': function( newListing ) {
      check(this.userId, String);
        check(newListing,
          {
            title: String,
            productID: String,
            sellPrice: Number,
            condition: String,
            meetLocation: String,
            listingNotes: Match.Optional(String)
          });
      let userCoords = [0,0];
      let userhasCoords = false;

      let product = Products.findOne( { _id: newListing.productID } );
      let profile = Profile.findOne({ profID: this.userId });

      if ( profile.hasLocation === true ){
          userCoords = profile.location.coordinates;
          userhasCoords = true;
      }

        let listing = _.extend(newListing, {
          views: 0,
          listOfferCount: 0,
          postDate: new Date(),
          country: profile.location.countryCode,
          sold: false,
          soldInfo: {
            soldPrice: null,
            soldDate: null
          },
          images: [],
          active: true,
          listedBy: this.userId,
          seller: Meteor.user().username,
          hasLocation: userhasCoords,
          location:{
            type: 'Point',
            coordinates: userCoords,
          }
        });

      Products.update( {_id: listing.productID},{$inc: {listingsCount: 1} } );
      Profile.update( {_id: profile._id}, {$inc: {myListings: 1} } );

      return Listings.insert(listing);
  },

  //Upload changes to listing.
  'updateListing': function(postId, productId, updateListing) {
      check(this.userId, String);
      check(postId, String);
      check(productId, String);
      check(updateListing, {
        title: String,
        sellPrice: Number,
        condition: String,
        meetLocation: String,
        listingNotes: Match.Optional(String)
      });

      let profile = Profile.findOne({ profID: this.userId });

      let update = updateListing;

      if( profile.hasLocation === true ){
        update = _.extend(update,{
          hasLocation: true,
          location: {
            type: 'Point',
            coordinates: [
              profile.location.coordinates[0],
              profile.location.coordinates[1]
            ]
          }
        });
      }

      return Listings.update({
        _id: postId,
        listedBy: this.userId
      },{
        $set: update
      });
  },

  //Upload images of listing.
  'insertImage': function(listId, imgId) {
      check(this.userId, String);
      check(listId, String);
      check(imgId, String);

      Uploads.collection.update({ _id: imgId },{ $set:{ 'meta.userId': this.userId  }});

      return Listings.update({
        _id: listId,
        listedBy: this.userId
      },{
        $push: {
          images: imgId
        }
      });
  },

  //Remove uploaded image, and update the Listing.
  'removeUpload': function(listId, imgId) {
    check(this.userId, String);
    check(imgId, String);
    check(listId, String);

    Listings.update({
        _id: listId,
        listedBy: this.userId
      },{
        $pull: { images: imgId }
      });
    Uploads.remove({ _id: imgId, 'meta.userId': this.userId });
  },
});
