    var options = {
        keepHistory: 1000 * 60 * 5,
        localSearch: true
    };
    var fields = ['title'];

    Search = new SearchSource('listings', fields, options);
