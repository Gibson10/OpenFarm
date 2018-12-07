import _ from 'underscore';

Listings._ensureIndex({
  "title": "text"
});

//Search function.
SearchSource.defineSource('listings', function(search, options) {
  if(search) {
    let regExp = buildRegExp(search);

    let selector = {
      title: regExp,
      sold: false,
      active: true
    }

    if ( options.distance !== null && options.coordinates !== null ){
      selector = _.extend(selector,{
        hasLocation: true,
        location: {
          $geoWithin: {
            $centerSphere: [
              [ options.coordinates[0], options.coordinates[1] ],
              options.distance / 6371
            ]
          }
        }
      });
    }

    var result = Listings.find(
      selector,
      {
        fields: {
          score: { $meta: "textScore" }
        },
        sort: {
          score: { $meta: "textScore" },
          listOfferCount: -1,
          views: -1,
          listingsCount: -1,
          postDate: -1,
          title: 1,
        },
        limit: 10,
        skip: options.skip
      });

      return {
        data: result.fetch(),
        metadata: { count: result.count() }
      }
  }
  else {
    if ( options.distance !== null && options.coordinates !== null ){
      let limit = {
        hasLocation: true,
        location: {
          $geoWithin: {
            $centerSphere: [
              [ options.coordinates[0], options.coordinates[1] ],
              options.distance / 6371
            ]
          }
        }
      }
      var result = Listings.find(limit, { limit: 10, skip: options.skip }).fetch();

      return {
        data: result.fetch(),
        metadata: {count: result.count()}
      }
    }
    else {
      var result = Listings.find({},{ limit: 10, skip: options.skip }).fetch();

      return {
        data: result.fetch(),
        metadata: {count: result.count()}
      }
    }
  }
});

//Regex for search text.
function buildRegExp(search) {
  let words = search.trim().split(/[ \-\:]+/);
  let exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  let fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}
