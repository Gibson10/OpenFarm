import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

//Chat List
Meteor.publishComposite('chatList', function(setlimit) {
  check(setlimit, Match.Integer);
  return {
    find: function() {
      return ChatRoom.find({
        $or: [{
          buyer: this.userId, buyerActive: true
        },{
          seller: this.userId, sellerActive: true
        }]
      },{
        limit: setlimit,
        sort: { latestMsg: -1 }
      });
    },
    children: [{
      find: function(chat) {
        return Messages.find({
          chatID: chat._id,
          sentBy: { $ne: this.userId },
          read: false
        },{
          fields: {
            body: false
          }
        });
      }
    },{
      find: function(chat) {
        return Profile.find({
          $and: [{
            profID: { $ne: this.userId }
          },{
            $or: [{
              profID: chat.buyer
            },{
              profID: chat.seller
            }]
          }]
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
      find: function(chat) {
        return ProfileImg.collection.find({
          $and: [{
            'meta.userId': { $ne: this.userId }
          },{
            $or: [{
              'meta.userId': chat.buyer
            },{
              'meta.userId': chat.seller
            }]
          }]
        },{
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

//Messages
Meteor.publish('chatMsg', function(chatId) {
  check(chatId, String);
  return Messages.find({
    $or: [{
      chatID: chatId,
      for: this.userId
    },{
      chatID: chatId,
      sentBy: this.userId
    },{
      chatID: chatId,
      sentBy: 'system'
    }]
  },{
    sort: {
      sent: 1
    }
  });
});

Meteor.publishComposite('thisChat', function(chatId) {
  check(chatId, String);
  return{
    find: function() {
      return ChatRoom.find({
        $or: [{
          _id: chatId,
          buyer: this.userId,
          buyerActive: true
        },{
          _id: chatId,
          seller: this.userId,
          sellerActive: true
        }]
      },{
          limit: 1
      });
    },
    children: [{
      find: function(chat) {
        return Profile.find({
          $and: [{
            profID: { $ne: this.userId }
          },{
            $or: [{
              profID: chat.buyer
            },{
              profID: chat.seller
            }]
          }]
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
      find: function(chat) {
        return ProfileImg.collection.find({
          $and: [{
            'meta.userId': { $ne: this.userId }
          },{
            $or: [{
              'meta.userId': chat.buyer
            },{
              'meta.userId': chat.seller
            }]
          }]
        },{
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

Meteor.publishComposite('chatDetails', function(chatId) {
  check(chatId, String);
  return{
    find: function() {
      return ChatRoom.find({
        $or: [{
          _id: chatId,
          buyer: this.userId,
          buyerActive: true
        },{
          _id: chatId,
          seller: this.userId,
          sellerActive: true
        }]
      },{
          limit: 1
      });
    },
    children: [{
      find: function(chat) {
        return Profile.find({
          $and: [{
            profID: { $ne: this.userId }
          },{
            $or: [{
              profID: chat.buyer
            },{
              profID: chat.seller
            }]
          }]
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
      find: function(chat) {
        return ProfileImg.collection.find({
          $and: [{
            'meta.userId': { $ne: this.userId }
          },{
            $or: [{
              'meta.userId': chat.buyer
            },{
              'meta.userId': chat.seller
            }]
          }]
        },{
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
      find: function(chat) {
        if ( chat.seller === this.userId ){
          return Listings.find({ _id: chat.listingID },{ limit: 1 });
        }
        else {
          return Listings.find({
            _id: chat.listingID
          },{
            limit: 1,
            fields: {
              views: false,
              listOfferCount: false
            }
          });
        }
      }
    },{
      find: function(chat) {
        return Uploads.collection.find({ 'meta.listID': chat.listingID },{
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
      find: function(chat) {
        if ( chat.seller === this.userId ){
          return Offers.find({ offerBy: chat.buyer },{ limit: 1 });
        }
        else {
          return;
        }
      }
    }]
  }
});
