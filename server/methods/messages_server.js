import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';
import moment from 'moment';
import { Email } from 'meteor/email'

Meteor.methods({

  //Create new chat for users.
  'loadChat': function(newChat, action) {
          check( this.userId, String );
          check( action, String );
          check( newChat, {
                  listingID: String,
                  prodName: String,
                  offerID: Match.OneOf(String, null)
          });
          switch (action) {
                  case 'buy now':
                          var thisPost = Listings.findOne({ _id: newChat.listingID });

                          var price = thisPost.sellPrice;
                          var buyerid = this.userId;
                          var buyername = Meteor.users.findOne({ _id: this.userId }).username;
                          break;

                  case 'accept':
                          var thisPost = Listings.findOne({ _id: newChat.listingID, listedBy: this.userId });
                          var offer = Offers.findOne({ _id: newChat.offerID });

                          var price = offer.offerAmount;
                          var buyerid = offer.offerBy;
                          var buyername = offer.buyer;
                          break;
          }
          let chat = _.extend(newChat, {
                  agreedPrice: price,
                  buyer: buyerid,
                  buyerName: buyername,
                  seller: thisPost.listedBy,
                  sellerName: thisPost.seller,
                  latestMsg: new Date(),
                  buyerActive: true,
                  sellerActive: true
          });
          return ChatRoom.insert(chat);
  },

  //Generate system message on chat.
  'systemMsg': function(action, chatID){
    check(this.userId, String);
    check(action, String);
    check(chatID, String);
    var thisChat =  ChatRoom.findOne({
                      _id: chatID,
                      $or: [{
                        buyer: this.userId
                      },{
                        seller: this.userId
                      }]
                    });
    let date = new Date();
    switch (action) {
      case 'Buy':
        var thisPrice = thisChat.agreedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var sysmsg = thisChat.buyerName.bold() + " wants to buy your " + thisChat.prodName.bold() + " for KSH" + thisPrice + ".";
        var msgFor = thisChat.seller;
        break;

      case 'Accept':
        var thisPrice = thisChat.agreedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var sysmsg = thisChat.sellerName.bold() + " accepts to sell this " + thisChat.prodName.bold() + " for KSH" + thisPrice + ".";
        var msgFor = thisChat.buyer;
        break;

      case 'CancelBuyer':
        var sysmsg = thisChat.buyerName.bold() + " has left this discussion.";
        ChatRoom.update({ _id: thisChat._id },{ $set: { latestMsg: date }});
        var msgFor = thisChat.seller;
        break;

      case 'CancelSeller':
        var sysmsg = thisChat.sellerName.bold() + " has left this discussion.";
        ChatRoom.update({ _id: thisChat._id },{ $set: { latestMsg: date }} );
        var msgFor = thisChat.buyer;
        break;

      case 'Sold':
        var sysmsg = thisChat.sellerName.bold() + " has sold this item.";
        ChatRoom.update( {_id: thisChat._id}, {$set: { latestMsg: date }} );
        var msgFor = thisChat.buyer;
        break;
    }

    if ( ChatRoom.findOne({ _id: chatID, $or: [{ buyer: msgFor, buyerActive: true },{ seller: msgFor, sellerActive: true }] }) ) {
      
      return Messages.insert({
        chatID: thisChat._id,
        sentBy: 'system',
        sent: date,
        for: msgFor,
        body: sysmsg,
        read: false
      }, function(err){
        if(!err){
          Meteor.call('sendNotification', msgFor);
          return;
        }
      });

    } else {
      console.log('Other user has left.');
      return;
    }
  }
});
