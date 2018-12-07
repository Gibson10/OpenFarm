import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

Meteor.methods({

        //Send new offer to Listing. Update Offer counts.
        'newOffer': function(thisOffer, productID) {
                check( this.userId, String );
                check( productID, String );
                check( thisOffer, {
                        listingID: String,
                        offerAmount: Number,
                });
                let offer = _.extend(thisOffer, {
                        offerDate: new Date(),
                        offerBy: this.userId,
                        buyer: Meteor.users.findOne({ _id: this.userId }).username
                });
                let thisUser = Profile.findOne( { profID: this.userId } );

                Listings.update( { _id: thisOffer.listingID }, { $inc: { listOfferCount: 1 } } );
                Products.update( { _id: productID }, { $inc: { productOffersCount: 1 } } );
                Profile.update( { _id: thisUser._id }, { $inc: { myOffers: 1 } } );

                return Offers.insert(offer);
        },

        //Change offer amount.
        'changeOffer': function( offerID, newAmount ) {
                check( this.userId, String );
                check( offerID, String );
                check( newAmount, Number );

                Offers.update( { _id: offerID, offerBy: this.userId },
                                {$set: {
                                        offerAmount: newAmount,
                                        offerDate: new Date()
                }});
        },

        //Remove offer for the Listing. Update offer counts.
        'removeOffers': function( offerID, listingID, productID ) {
                check( this.userId, String );
                check( offerID, String );
                check( listingID, String );
                check( productID, String );
                let profID = Profile.findOne( { profID: this.userId } )._id;

                Listings.update( { _id: listingID }, {$inc: { listOfferCount: -1 } } );
                Profile.update( { _id: profID }, {$inc: { myOffers: -1 } } );
                Products.update( { _id: productID }, {$inc: { productOffersCount: -1 } } );
                return Offers.remove({ _id: offerID });
        }

});
