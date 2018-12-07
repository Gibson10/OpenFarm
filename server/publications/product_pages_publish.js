import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

//Product Page
Meteor.publishComposite('productBuyer', function(postId) {
  check(postId, String);
  return {
    find: function() {
      return Listings.find({
        _id: postId
      },{
        limit: 1,
        fields: { views: false }
      });
    },
    children: [{
      find: function(listing) {
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
            }
          });
      },
    },{
      find: function(listing) {
        return Offers.find({ listingID: listing._id }, { fields: { buyer: false }});
      },
    },{
      find: function(listing) {
        return Profile.find({
          profID: listing.listedBy
        },{
          fields: {
            myOffers: false,
            myListings: false,
            productSold: false
          },
          limit: 1
        });
      },
    },{
      find: function(listing) {
        return ProfileImg.collection.find({ 'meta.userId': listing.listedBy },{
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
    },{
      find: function(listing) {
        return ChatRoom.find({
          listingID: listing._id,
          buyer: this.userId,
          buyerActive: true,
          sellerActive: true
        });
      }
    }]
  }
});

Meteor.publishComposite('productSeller', function(postId) {
  check(postId, String);
  return {
    find: function() {
      return Listings.find({ _id: postId, listedBy: this.userId }, { limit: 1 });
    },
    children: [{
      find: function(listing) {
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
            }
          });
      },
    },{
      find: function(listing) {
        return Offers.find({ listingID: listing._id });
      },
      children: [{
        find: function(offer, listing) {
          return Profile.find({
            profID: offer.offerBy
          },{
            fields: {
              myOffers: false,
              myListings: false,
              productSold: false
            },
            limit: 1
          });
        }
      },{
        find: function(offer, listing) {
          return ProfileImg.collection.find({ 'meta.userId': offer.offerBy },{
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
      find: function(listing) {
        return ChatRoom.find({
          listingID: listing._id,
          seller: this.userId,
          sellerActive: true,
          buyerActive: true
        });
      }
    }]
  }
});

Meteor.publish('product', function(productId) {
    check(productId, String);
    return Products.find({
      _id: productId
    },{
      limit: 1,
      fields: {
        productOffersCount: false,
        productSoldCount: false
      }
    });
});

Meteor.publish('Others', function() {
    return Products.find({
      _id: 'others'
    },{
      fields: {
        productOffersCount: false,
        productSoldCount: false
      }
    });
});
