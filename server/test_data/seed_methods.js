import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'seed': function( postID ) {
        check( this.userId, String );
        check( postID, String );
        if ( Profile.findOne({ isTest: true }) ) {
        let thisPost = Listings.findOne({ _id: postID });

        Profile.find({ isTest: true }).forEach( function(user) {
            let offer = {
                listingID: postID,
                offerAmount: Math.floor(Math.random()*100) + 1,
                offerDate: new Date(),
                offerBy: user.profID,
                buyer: user.profName,
                isTest: true
            }
            let chat = {
                listingID: postID,
                prodName: thisPost.title,
                agreedPrice: thisPost.sellPrice,
                buyer: user.profID,
                buyerName: user.profName,
                seller: thisPost.listedBy,
                sellerName: thisPost.seller,
                latestMsg: new Date(),
                buyerActive: true,
                sellerActive: true,
                isTest: true
            };
            let feed = {
                userID: thisPost.listedBy,
                postDate: new Date(),
                linkID: thisPost._id,
                linkType: 'mypost',
                body: "<b>" + user.profName + "</b>" + " sent an offer to your post: " + "<b>" + thisPost.title + "." + "</b>",
                read: false,
                isTest: true
            }

            Listings.update({ _id: postID }, { $inc: { listOfferCount: 1 }});
            Products.update({ _id: thisPost.productID }, { $inc: { productOffersCount: 1 }});
            Profile.update({ _id: user.profID },{ $inc: { myOffers: 1 }});
            Offers.insert(offer);
            Feeds.insert(feed);
            ChatRoom.insert(chat, function(err, chatid) {
                if (!err) {
                    let newMsg = {
                        body: 'Hello there!',
                        chatID: chatid,
                        sentBy: user.profID,
                        for: thisPost.listedBy,
                        user: user.profName,
                        sent: new Date(),
                        read: false,
                        isTest: true
                    };
                    let testRating = Math.random() >= 0.5;
                    let feedback = {
                        chatID: chatid,
                        goodRating: testRating,
                        body: "",
                        user: thisPost.listedBy,
                        postBy: user.profID,
                        postName: user.profName,
                        postDate: new Date(),
                        isTest: true
                    }
                    let prof = Profile.findOne({ profID: thisPost.listedBy });
                    if (testRating === true) {
                        Profile.update( { _id: prof._id }, { $inc: { goodRating: 1 } } );
                    } else if (testRating === false)  {
                        Profile.update( { _id: prof._id }, { $inc: { badRating: 1 } } );
                    }
                    Messages.insert(newMsg);
                    Feedback.insert(feedback);
                }
             });
        });
        console.log('Seed complete.');
      } else {
        console.log('Test data disabled.');
      }
    },
    'initSeed': function(){
      console.log('Seeding test data.');
        let testusers = [
            { id: 'test001',
              username: 'johndoe',
              image: '/images/users/profile_1.jpg'
             },
            { id: 'test002',
              username: 'martyx',
              image: '/images/users/profile_2.jpg'
             },
            { id: 'test003',
              username: 'loremipsum',
              image: '/images/users/profile_3.jpg'
             },
            { id: 'test004',
              username: 'batman',
              image: '/images/users/profile_4.jpg'
             },
        ];

        for (let i = 0; i < testusers.length; i++) {
            let lng = Math.random() * (180 - (-180) ) + (-180);
            let lat = Math.random() * (90 - (-90) ) + (-90);

            let newprofile = {
              profID: testusers[i].id,
              profName: testusers[i].username,
              profImage: testusers[i].image,
              profImageID: null,
              hasLocation: true,
              location: {
                  type: 'Point',
                  coordinates: [ lng, lat ],
                  city: 'Test City',
                  country: 'Test Country',
                  region: 'Test Region',
                  contryCode: 'CC',
              },
              goodRating: 0,
              badRating: 0,
              myOffers: 0,
              myListings: 0,
              productSold: 0,
              isTest: true
            }
            Profile.insert(newprofile);
        };

        Products.find().forEach( function(thisProd) {

          let testUser = Profile.find({ isTest: true }).fetch();
          let x = Math.floor((Math.random() * 10)) + 4;

          for (let i = 0; i < x; i++) {
            let u = Math.round((Math.random() * 3));

            let lng = Math.random() * (180 - (-180) ) + (-180);
            let lat = Math.random() * (90 - (-90) ) + (-90);

            Listings.insert({
              productID: thisProd._id,
              title: 'Sample ' + thisProd.name + ' ' + i,
              sellPrice: Math.floor(Math.random()*100) + 1,
              condition: 'Used',
              images: [],
              meetLocation: 'Location' + i,
              listingNotes: '',
              seller: testUser[u].profName,
              listedBy: testUser[u].profID,
              listViews: 0,
              offerCount: 0,
              postDate: new Date(),
              active: true,
              sold: false,
              isTest: true,
              hasLocation: true,
              location: {
                type: 'Point',
                coordinates: [ lng, lat ]
              }
            });

            Products.update( {_id: thisProd._id},{$inc: {listingsCount: 1} } );
          }
        });
    },
    'seedImages': function() {
      let testUsers = ['test001', 'test002', 'test003', 'test004']
      if ( Listings.find({ listedBy: { $in: testUsers }, images: [] }).count() !== 0 ){
        console.log('Getting Images.');
        let a = 0;
        let images = {
          accessories: [
            'images/listings/accessories1.jpg',
            'images/listings/accessories2.jpg',
            'images/listings/accessories3.jpg',
            'images/listings/accessories4.jpg'
          ],
          beauty: [
            'images/listings/beauty1.jpg',
            'images/listings/beauty2.jpg',
            'images/listings/beauty3.jpg',
            'images/listings/beauty4.jpg'
          ],
          clothes: [
            'images/listings/clothes1.jpg',
            'images/listings/clothes2.jpg',
            'images/listings/clothes3.jpg',
            'images/listings/clothes4.jpg'
          ],
          computer: [
            'images/listings/computer1.jpg',
            'images/listings/computer2.jpg',
            'images/listings/computer3.jpg',
            'images/listings/computer4.jpg'
          ],
          food: [
            'images/listings/food1.jpg',
            'images/listings/food2.jpg',
            'images/listings/food3.jpg',
            'images/listings/food4.jpg'
          ],
          gadget: [
            'images/listings/gadget1.jpg',
            'images/listings/gadget2.jpg',
            'images/listings/gadget3.jpg',
            'images/listings/gadget4.jpg'
          ],
          home: [
            'images/listings/home1.jpg',
            'images/listings/home2.jpg',
            'images/listings/home3.jpg',
            'images/listings/home4.jpg'
          ],
          toys: [
            'images/listings/toys1.jpg',
            'images/listings/toys2.jpg',
            'images/listings/toys3.jpg',
            'images/listings/toys4.jpg'
          ]
        }
        Listings.find({ listedBy: { $in: testUsers }, images: [] }).forEach( function(listing){
          let product = Products.findOne({ _id: listing.productID });

          if ( product.name === 'Gadgets' ) { var image = images.gadget }
          else if ( product.name === 'Computers' ) { var image = images.computer }
          else if ( product.name === 'Fashion & Clothing' ) { var image = images.clothes }
          else if ( product.name === 'Accessories' ) { var image = images.accessories }
          else if ( product.name === 'Toys & Hobbies' ) { var image = images.toys }
          else if ( product.name === 'Home & Furniture' ) { var image = images.home }
          else if ( product.name === 'Food Products' ) { var image = images.food }
          else if ( product.name === 'Health & Beauty' ) { var image = images.beauty }

          let imageUrl = Meteor.absoluteUrl( image[a] );
          a++;
          if (a > 3) {
            a = 0;
          }

          let name = image[a].substring( image[a].indexOf('/listings/') + 10 );

          Uploads.load(imageUrl, {
            fileName: name,
            meta: {
              listID: listing._id,
              isTest: true
            }
          },
          function(err, file){
            if(!err) {
              Listings.update({
                _id: listing._id,
              },{
                $push: {
                  images: file._id
                }
              });
            } else {
              console.log("error uploading images.")
            }
          }, true);
        });
      }
      else {
        return;
      }
    },
    'clearTest': function(){
      console.log('Reseting test data.')
      if ( Listings.findOne({ isTest: true }) ) {
        Listings.find({ isTest: true }).forEach(function(data){
          Listings.remove({ _id: data._id });
          Products.update( {_id: data.productID},{$inc: {listingsCount: -1} } );
        });
      }
      if ( Profile.findOne({ isTest: true }) ) {
        Profile.find({ isTest: true }).forEach(function(data){
          Profile.remove({ _id: data._id });
        });
      }
      if ( Uploads.findOne({ 'meta.isTest': true }) ) {
        Uploads.find({ 'meta.isTest': true }).forEach(function(data){
          Uploads.remove({ _id: data._id });
        });
      }
      if ( Offers.findOne({ isTest: true }) ) {
        Offers.find({ isTest: true }).forEach(function(data){
          let listing = Listings.findOne({ _id: data.listingID })

          Offers.remove({ _id: data._id });

          Listings.update({ _id: listing._id }, { $inc: { listOfferCount: -1 }});
          Products.update({ _id: listing.productID }, { $inc: { productOffersCount: -1 }});
        });
      }
      if ( Feeds.findOne({ isTest: true }) ) {
        Feeds.find({ isTest: true }).forEach(function(data){
          Feeds.remove({ _id: data._id });
        });
      }
      if ( Feedback.findOne({ isTest: true }) ) {
        Feedback.find({ isTest: true }).forEach(function(data){
          Feedback.remove({ _id: data._id });
        });
      }
      if ( ChatRoom.findOne({ isTest: true }) ) {
        ChatRoom.find({ isTest: true }).forEach(function(data){
          if( Messages.findOne({ chatID: data._id }) ){
            Messages.find({ chatID: data._id }).forEach(function(msg){
              Messages.remove({ _id: msg._id });
            })
          }
          ChatRoom.remove({ _id: data._id });
        });
      }
    }
});
