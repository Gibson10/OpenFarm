import { _meteorAngular } from 'meteor/angular';
import { Session } from 'meteor/session';

angular
  .module('salephone')
  .filter('distance', distance);

function distance () {
  return function (coordinates) {
    if ( !coordinates || !Session.get('myCoordinates')  ) return;

    let myCoordinates = Session.get('myCoordinates');

    let buyerCoordinates = [ myCoordinates.lng, myCoordinates.lat  ]
    let d = getDistance(coordinates, buyerCoordinates);

    if (d < 1) {
      return (d * 1000).toFixed(0) + ' m';
    }
    else if ( d > 99 && d < 1000 ) {
      return d.toFixed(0) + ' km';
    }
    else if ( d > 999 ) {
      return d.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' km';
    }
    else {
      return d.toFixed(1) + ' km';
    }
  };
}

function getDistance(sellerCoords, buyerCoords){
  let R = 6371; //earth radius in KM

  let latA = sellerCoords[1] * Math.PI / 180;
  let latB = buyerCoords[1] * Math.PI / 180;
  let x = ( buyerCoords[0] - sellerCoords[0] ) * Math.PI / 180;
  let y = Math.sin( latA ) *  Math.sin( latB ) + Math.cos( latA ) * Math.cos( latB ) * Math.cos(x);
  let d = Math.acos(y) * R;

  return d;
}
