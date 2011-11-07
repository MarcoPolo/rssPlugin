//This file defines variables and is the basis for the rest of the code


var googleFeedsApi='https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=1300&key=ABQIAAAAuIlbOmUd3gJTNVDSvX8ZBBThVXKRlugNJ0FXtFSdeFPX98YKrhQMO67lQJHw2mO0gu2r-chAP3vHeg&q='

construct()

//function to build the plugin on the site
function construct(){
    
    if (typeof localStorage['GSSFeeds'] == 'undefined') {
        localStorage['GSSFeeds'] = []
    }

    injectMenu();
}

function destruct(){
    $('#GSS').remove();
    $('.gss').remove();
}



//Check local storage to see if we have any playlist saved
function checkExistingFeeds(){
    //gssfeeds is an array of RSS titles
    refreshing = false; //by default we are not refreshing any playlist
    if (localStorage['GSSFeeds'] != '' && typeof localStorage['GSSFeeds'] != 'undefined') {
        GSSFeeds = JSON.parse(localStorage['GSSFeeds'])
        for (var i=0; i < GSSFeeds.length; i++){
            injectRSSPlaylist(GSSFeeds[i]);
        }
    } else {
        GSSFeeds = [];
    }
}


//function to faciliate the comparison
function makeComparable(name){
    try {
    name.replace('&amp','&');
    name = name.toLowerCase();
    //remove paranthetical information
    name = name.replace(/ *\([^)]*\) */g, "");

    //remove ' 
    name = name.replace("'", "");
    }  catch (err) {
        console.error("couldn't print",name);
        return;
    }
    return name;
}

//function to fetch the data from the RSS feed
//In order to avoid the problem with Access-Control-Allow-Origin
//Google feeds api is used to proxy the information.
//Google feeds allows formats the XML into JSON, NICE!
function getRSS(rssURL, refreshing){
    GSS = {};
    GSS.songs = [];
    GSS.SongIDs = [];
    GSS.refreshing = false;
    var delimiter = '|#|';
    if(rssURL.indexOf('Array') != -1){
        buildArraySearchTerms(rssURL);
        return false;
    }else{
        $.getJSON(googleFeedsApi+rssURL+'&callback=?', function(resp){
            try {
                RSS = resp.responseData.feed;
            } catch (err) {
                //something went wrong and we didn't get data, so lets clean everything up again
                clearLoadingIcon();
            }
            RSS.songs = [];
            GSS.title = RSS.title;
            GSS.feedUrl = RSS.feedUrl;

            if (RSS.entries.length == 0){
                console.log('invalid');
                clearLoadingIcon();
            }
            urlMapper();
        })
    }
}


