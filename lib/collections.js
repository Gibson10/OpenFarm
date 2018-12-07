import { Mongo } from 'meteor/mongo';

Products = new Mongo.Collection('products');  // Products or category data for listings.
Listings = new Mongo.Collection('listing'); // Listings data.
Offers = new Mongo.Collection('offers'); // Offers data for each listing.
Profile = new Mongo.Collection('profile');  // User profile data for public viewing. (Meteor.user Data is private.)
ChatRoom = new Mongo.Collection('chatroom'); // Chat data for each user.
Messages = new Mongo.Collection('messages'); // Messages data for each Chat.
Feedback = new Mongo.Collection('feedback'); // Feedback data for each User.
Feeds = new Mongo.Collection('feeds'); // Activity feed data for each user.

if (Meteor.isServer) {
  Profile._ensureIndex({
    "location": "2dsphere"
  });
  Listings._ensureIndex({
    "location": "2dsphere"
  });
}

Products.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Listings.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Offers.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Profile.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

ChatRoom.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Messages.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Feedback.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});

Feeds.deny({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    },
});
