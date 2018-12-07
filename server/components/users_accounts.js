import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import _ from 'underscore';

//User Account creation functions.
Accounts.onCreateUser(function(options, user) {
  if ( !user.services.password ){
    if ( user.services.facebook ){
      var existingUser = Accounts.findUserByEmail( user.services.facebook.email );
      if ( !existingUser ) {
        user.emails = [];
        user.username = user.services.facebook.email.substr( 0, user.services.facebook.email.indexOf("@") );
        user.emails.push( { address: user.services.facebook.email, verified: true } );
        return user;
      }
      //If email in Oauth login is already is registered, merge with existing account.
      else if ( existingUser.emails[0].verified === true ) {
        existingUser.services.facebook = user.services.facebook;
        Meteor.users.remove({ _id: existingUser._id });
        return existingUser;
      }
      //Error if registered email is not yet verified.
      else if ( existingUser.emails[0].verified === false )  {
        Accounts.sendVerificationEmail( existingUser._id );
        throw new Meteor.Error('Email exists.', 'Please validate your email.');
      }
    }
    else if ( user.services.google ) {

      var existingUser = Accounts.findUserByEmail( user.services.google.email );
      if ( !existingUser ) {
        user.emails = [];
        user.username = user.services.google.email.substr( 0, user.services.google.email.indexOf("@") );
        user.emails.push( { address: user.services.google.email, verified: true } );
        return user;
      }
      //If email in Oauth login is already is registered, merge with existing account.
      else if ( existingUser.emails[0].verified === true ) {
        existingUser.services.google = user.services.google;
        Meteor.users.remove({ _id: existingUser._id });
        return existingUser;        
      }
      //Error if registered email is not yet verified.
      else if ( existingUser.emails[0].verified === false )  {
        Accounts.sendVerificationEmail( existingUser._id );
        throw new Meteor.Error('Email exists.', 'Please validate your email.');
      }
    }
  }
  else {
    user.emails = [{
      address: options.email,
      verified: false
    }]
    user.registered_emails = [{
      address: options.email,
      verified: false
    }]
  return user;
  }
});
