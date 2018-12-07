import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

Meteor.methods({

        //Leave the Chat as the buyer.
        'cancelBuyer': function(chatID) {
                check(this.userId, String);
                check(chatID, String);

                ChatRoom.update( { _id: chatID, buyer: this.userId }, { $set: { buyerActive: false } });
        },

        //Leave the Chat as the seller.
        'cancelSeller': function(chatID) {
                check(this.userId, String);
                check(chatID, String);

                ChatRoom.update( { _id: chatID, seller: this.userId }, { $set: { sellerActive: false } });
        },

        //Send new message in chat, and update Chat with new activity.
        'newMsg': function(newmsg){
                check(this.userId, String);
                check(newmsg, {
                        chatID: String,
                        body: String,
                });

                let chat =  ChatRoom.findOne({
                  $and: [{
                    _id: newmsg.chatID
                  },{
                    $or: [{
                      buyer: this.userId
                    },{
                      seller: this.userId
                    }]
                  }]
                });
                if ( chat.buyer != this.userId ) {
                    var msgFor = chat.buyer;
                }
                else if ( chat.seller != this.userId ) {
                    var msgFor = chat.seller;
                }

                let msg = _.extend(newmsg, {
                            chatID: chat._id,
                            sentBy: this.userId,
                            for: msgFor,
                            user: Meteor.users.findOne({ _id: this.userId }).username,
                            sent: new Date(),
                            read: false
                          });

                ChatRoom.update( {_id: chat._id}, {$set: { latestMsg: msg.sent }} );
                

                Messages.insert(msg, function(err){
                  if (err) {
                    throw new Meteor.Error('Error sending message.', 'Error sending message.');
                  }
                  else {
                    Meteor.call('sendNotification', msg.for);
                    return;
                  }
                });
        },

        //Set messages as read.
        'setRead': function(msgId) {
                check(this.userId, String);
                check(msgId, String);

                if( Messages.findOne({ _id: msgId, for: this.userId, read: false }) ) {
                  Messages.update({ _id: msgId, for: this.userId },{ $set: { read: true }});
                }
                else {
                  return;
                }
        },
});
