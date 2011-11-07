//The code here deals with:
//mapping the rss url to a specific parser
//parsing the rss feed
//experimental support for JSON list of artist and songnames 



//map the rss feed url to a specific method of parsing the feed
function urlMapper(){
    var url = RSS.feedUrl;

    if(url.indexOf('hypem') != -1){
        GSS.favicon = 'http://hypem.com/favicon.png';
        buildHypeMSearchTerms();
        return;
    } else if(url.indexOf('itunes') != -1) {
        console.log('itunes feed detected');
        GSS.favicon = 'http://www.wolframcdn.com/navigation/favicon/a/apple_com.png';
        buildiTunesSearchTerms();
        return;
    } else if(url.indexOf('Pitchfork') != -1) {
        console.log('pitchfork feed detected');
        GSS.favicon = 'http://pitchfork.com/favicon.ico';
        buildHypeMSearchTerms();
        return;
    } else {
        console.log("I don't recognize this source, so we'll do it live!");
        GSS.favicon = 'http://hypem.com/favicon.png';
        buildHypeMSearchTerms();
        return
    }
}

//parser for hypem or hypem-like feeds
function buildHypeMSearchTerms(){
    var entries = RSS.entries;
    for (var i=0; i<RSS.entries.length; i++){
		searchTerms = [];
        console.log(entries[i].title);
        //To make sure that if a title doesn't have the hyphen it doesn't break the plugin
        if ( entries[i].title.indexOf(' - ') == -1 ) {
            entries[i].title = entries[i].title.concat(' - ');
        }
		searchTerms.push(entries[i].title.replace(/"/g,'').split(' - '));
		searchForTerms(searchTerms);
	}
}

//Parser for itunes feed
function buildiTunesSearchTerms(){
    var entries = RSS.entries;
    for (var i=0; i<RSS.entries.length; i++){
		searchTerms = [];
        //To make sure that if a title doesn't have the hyphen it doesn't break the plugin
        if ( entries[i].title.indexOf(' - ') == -1 ) {
            entries[i].title = entries[i].title.concat(' - ');
        }
		var swapingPlaces = entries[i].title.replace(/"/g,'').split(' - ');
        //to switch the terms, iTunes puts the artiest second
        swapingPlaces[1] = swapingPlaces.splice(0, 1, swapingPlaces[1])[0];
		searchTerms.push(swapingPlaces);
		searchForTerms(searchTerms);
	}
}

//Experimental feature that allows for mass searching on GS using a JSON Array
function buildArraySearchTerms(array){
    try {
        var jsonTerms = JSON.parse(array);
        GSS={};
        GSS.SongIDs = [];
        GSS.title = jsonTerms.title;

        RSS={};
        RSS.songs=[];
    }catch(err){
        //if it is the correct song lets store the song ids in here
        console.error("This wasn't properly formatted JSON")
        clearLoadingIcon();
        return;
    }
    //if the array is inverted
    if(array.indexOf('InvArray') != -1){
        var searchTerms = [];
        jsonTerms = jsonTerms.InvArray;
        RSS.entries = jsonTerms;
        for(var i=0; i<jsonTerms.length; i++){
            var swapingPlaces = jsonTerms[i].InvArray;
            swapingPlaces[1] = swapingPlaces.splice(0, 1, swapingPlaces[1])[0];
            searchTerms.push(swapingPlaces)
        }
        console.log(searchTerms);
        searchForTerms(searchTerm);
    }else{
        jsonTerms = jsonTerms.Array;
        RSS.entries = jsonTerms;
        console.log(jsonTerms);
        searchForTerms(jsonTerms);
    }
}

