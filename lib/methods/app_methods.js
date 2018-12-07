import { Meteor } from 'meteor/meteor';

Meteor.methods({

  //Return count of all Products in server.
  'allProducts': function() {
    return Products.find({ listingsCount: { $gt: 0 } }).count();
  },

  //Return count of all Products in server.
  'selectProduct': function() {
    return Products.find({}).count();
  },  

  //Return count of all Listings of the same Product in server.
  'allPosts': function(productId, options) {
    check(productId, String);
    check(options, {
      loaded: Number,
      skip: Number,
      distance: Match.OneOf(null, Number),
      coordinates: Match.OneOf(null, [Number]),
      sort: String
    });

    let selector = {
      productID: productId,
      active: true
    }

    if ( options.distance !== null && options.coordinates !== null ){
      selector = _.extend(selector,{
        location: {
          $geoWithin: {
            $centerSphere: [
              [ options.coordinates[0], options.coordinates[1] ],
              options.distance / 6371
            ]
          }
        }
      });

      if(Meteor.isServer){
        return Listings.find(selector).count();
      }
    }
    else {
      return Listings.find(selector).count();
    }

  },

  //Return count of all active Listings in server.
  'allListings': function() {
    return Listings.find({ active: true }).count();
  },

  //Return count of all Listings that user has posted.
  'myAllPosts': function() {
    return Listings.find({ listedBy: this.userId, active: true }).count();
  },

  //Return count of all offers by user.
  'allOffers': function() {
    return Offers.find({ offerBy: this.userId }).count();
  },

  //Return count of all activity feeds to user.
  'allFeeds': function() {
    return Feeds.find({ userID: this.userId }).count();
  },

  //Return count of all Chats of user.
  'allChats': function() {
    return ChatRoom.find({  $or: [{
                                buyer: this.userId, buyerActive: true },{
                                seller: this.userId, sellerActive: true
                            }]
                        }).count();
  },

  //Return count of all Messages in the chat.
  'allMsg': function(chatid) {
    check(chatid, String);
    return Messages.find({ sentBy: { $ne: 'system' }, chatID: chatid }).count();
  },

  //Return count of all Listings posted by selected user.
  'allUserPosts': function(profileId) {
    check(profileId, String);
    let prof = Profile.findOne({ _id: profileId });
    
    if(!prof){
      return
    }

    return Listings.find({ listedBy: prof.profID, active: true }).count();
  },

  //Return count of all Feedback posted for the user.
  'allFeedback': function(profileId) {
    check(profileId, String);
    let prof = Profile.findOne({ _id: profileId });
    
    if(!prof){
      return
    }
    
    return Feedback.find({ user: prof.profID }).count();
  }

});
