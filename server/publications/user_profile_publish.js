import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publishComposite('sellerProfile', function(profileId, setlimit) {
  check(profileId, String);
  check(setlimit, Match.Integer);
  return {
    find: function() {
      return Profile.find({
        _id: profileId
      },{
        limit: 1,
        fields: {
          myOffers: false,
          myListings: false,
          productSold: false
        }
      });
    },
    children: [{
      find: function(profile){
        return Feedback.find({
          user: profile.profID
        },{
          sort: { postDate: -1 },
          limit: setlimit,
          fields: { chatID: false }
        });
      },
      children: [{
        find: function(feedback, profile){
          return Profile.find({
            profID: feedback.postBy
          },{
            fields: {
              myOffers: false,
              myListings: false,
              productSold: false,
              badRating: false,
              goodRating: false,
              location: false
            },
            limit: 1
          });
        }
      },{
        find: function(feedback, profile){
          return ProfileImg.collection.find({ 'meta.userId': feedback.postBy },{
            fields: {
              name: false,
              extension: false,
              path: false,
              type: false,
              size: false,
              versions: false,
              isVideo: false,
              isAudio: false,
              isImage: false,
              isText: false,
              isJSON: false,
              isPDF: false,
              _storagePath: false,
              public: false
            },
            limit: 1
          });
        }
      }]
    },{
      find: function(profile){
        return ProfileImg.collection.find({ 'meta.userId': profile.profID },{
          fields: {
            name: false,
            extension: false,
            path: false,
            type: false,
            size: false,
            versions: false,
            isVideo: false,
            isAudio: false,
            isImage: false,
            isText: false,
            isJSON: false,
            isPDF: false,
            _storagePath: false,
            public: false
          },
          limit: 1
        });
      }
    }]
  }
});

Meteor.publishComposite('sellerPosts', function(profileId, options) {
  check(profileId, String);
  check(options, {
    loaded: Number,
    skip: Number
  });
  return {
    find: function() {
      return Profile.find({
        _id: profileId
      },{
        limit: 1,
        fields: {
          myOffers: false,
          myListings: false,
          productSold: false
        }
      });
    },
    children: [{
      find: function(profile) {
        return Listings.find({
          listedBy: profile.profID,
          active: true
        },{
          sort: { postDate: -1 },
          skip: options.skip,
          limit: options.loaded,
          fields: {
            _id: true,
            title: true,
            condition: true,
            productID: true,
            active: true,
            sold: true,
            sellPrice: true,
            postDate: true,
            images: true,
            listedBy: true,
            location:true,
            hasLocation: true
          }
        });
      },
      children: [{
        find: function(listing, profile) {
          return Offers.find({
            listingID: listing._id
          },{
            fields: {
              buyer: false,
              offerBy: false
            },
            sort: {
              offerAmount: -1,
              offerDate: 1
            },
            limit: 1
          });
        }
      },{
        find: function(listing, profile) {
          return Uploads.collection.find({ 'meta.listID': listing._id },{
              fields: {
                name: false,
                extension: false,
                path: false,
                type: false,
                size: false,
                versions: false,
                isVideo: false,
                isAudio: false,
                isImage: false,
                isText: false,
                isJSON: false,
                isPDF: false,
                _storagePath: false,
                public: false
              },
              limit: 1
            });
        }
      }]
    }]
  }
});
