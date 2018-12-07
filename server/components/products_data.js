
import { Meteor } from 'meteor/meteor';

// Products data. Initiate on startup.
if (Products.find().count() === 0) {
console.log('Loading Products data.');
  let products = [
      {
        name: 'vegetables and fruits',
        image: '/images/vegetables1.png',
        listingsCount: 0,
        productOffersCount: 0,
        productSoldCount: 0
      },
      
      {
        name: 'cereals',
        image: '/images/cereals.png',
        listingsCount: 0,
        productOffersCount: 0,
        productSoldCount: 0
      },
      {
        name: 'animals',
        image: '/images/animal.png',
        listingsCount: 0,
        productOffersCount: 0,
        productSoldCount: 0
      },
      {
        name: 'diary Products',
        image: '/images/diary.png',
        listingsCount: 0,
        productOffersCount: 0,
        productSoldCount: 0
      }
     
  ];
  products.forEach(function(product){
    Products.insert(product);
  });
}