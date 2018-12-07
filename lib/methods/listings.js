import { Meteor } from 'meteor/meteor';

Meteor.methods({
    //Change selling price of listing.
    'changePrice': function(listID, newAmount) {
        check(this.userId, String);
        check(listID, String);
        check(newAmount, Number);

        Listings.update({
          _id: listID, listedBy: this.userId
        },{
          $set: { sellPrice: newAmount }
        },{
          upsert: false
        });
    },

    //Remove Listing, including Offers for that Listing.  Update listing counts.
    'removeListing': function(listID) {
        check(this.userId, String);
        check(listID, String);
        let thisPost = Listings.findOne({ _id: listID, listedBy: this.userId });
        let profile = Profile.findOne({ profID: this.userId });

        if ( Offers.find( {listingID: thisPost._id} ).count() != 0 ){
            Offers.find({listingID: thisPost._id}).forEach( function(thisoffer) {

                //Method is located at tapshop/lib/methods/offers.js
                Meteor.call( 'removeOffers', thisoffer._id, thisPost._id, thisPost.productID );

                //Method is located at tapshop/server/methods/feed_server.js
                Meteor.call( 'insertFeed', 'removePost', thisoffer.offerBy, thisPost.title, null );
            });
        }

        Products.update( {_id: thisPost.productID}, {$inc: { listingsCount: -1 } } );
        Profile.update( {_id: profile._id}, {$inc: { myListings: -1 } } );
        Listings.update( { _id: thisPost._id, listedBy: this.userId }, {$set: { active: false } });
    },

    //Update Listing as sold, and remove all existing offers for the Listing.  Update all Listing counts.
    'soldListing': function(listID, chatID){
            check(this.userId, String);
            check(listID, String);
            check(chatID, String);
            let thisListing = Listings.findOne({_id: listID, listedBy: this.userId });
            let profile = Profile.findOne({ profID: this.userId });
            let chat = ChatRoom.findOne({ _id: chatID, listingID: listID, seller: this.userId });

            if ( Offers.find({ listingID: thisListing._id }).count() != 0 ){
                Offers.find({ listingID: thisListing._id }).forEach(function(thisoffer) {

                    //Method is located at tapshop/server/methods/feed_server.js
                    Meteor.call('insertFeed', 'soldProduct', thisoffer.offerBy, thisListing.title, null);

                    //Method is located at tapshop/lib/methods/offers.js
                    Meteor.call('removeOffers', thisoffer._id, thisListing._id, thisListing.productID);
                });
            }
            Products.update({
                _id: thisListing.productID
              },{
                $inc: {
                  listingsCount: -1,
                  productSoldCount: 1
                }
              });

            Profile.update({
                _id: profile._id
              },{
                $inc: { myListings: -1 }
              });

            Listings.update({
                _id: thisListing._id,
                listedBy: this.userId
              },{
                $set: {
                  sold: true,
                  soldInfo: {
                    soldPrice: chat.agreedPrice,
                    soldDate: new Date()
                  },
                  active: false
                }
              });
    },

    //Add a view to the Listing.
    'addView': function(listId) {
      check(listId, String);
      Listings.update({
          _id: listId,
          active: true,
          sold: false
        },{
          $inc: { views: 1 }
        });
    }
});
