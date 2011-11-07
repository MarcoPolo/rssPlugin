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

//This file contains the functions that directly access grooveshark (GS.service) 
//Also inside is the checkLastResult function that doesn't access GS directly, but is included for readablility



//searchTerms is an array of two item arrays. The first term in the sub array is the artist the second term is the song name
function searchForTerms(searchTerms){
    //just another way to iterate through each term
	searchTerms.map(function(term){
        //create the search term that will be fed into GS.service. It goes along the lines of song:songname artist:artistname
        searchTerm = ('song:'+makeComparable(term[1]) + ' ' + 'artist:' + makeComparable(term[0]));
        GS.service.getSearchResultsEx(searchTerm, true, null, function(resp){
            RSS.songs.push({'artist':makeComparable(term[0]), 'songname':makeComparable(term[1]), 'results':resp.result, songInfo:''});
            //now lets check the result of the search to make sure that we got the same song that was in the rss feed
            checkLastResult();
        }, null)
	});
}

function checkLastResult(){
    var song = RSS.songs[RSS.songs.length-1]; //get the last thing we put in
    //iterate through all of the results we found in the search
    for (var resultIndex = 0; resultIndex<song.results.length; resultIndex++){
        var result = song.results[resultIndex]; 
        changeLoadingPercent((RSS.songs.length/RSS.entries.length)*100);

        //only if the song name and the artist name are the same from the search and the rss feed.
        if((makeComparable(result.ArtistName) == makeComparable(song.artist)) && (makeComparable(result.SongName) == makeComparable(song.songname)) ){
            console.log('found the correct result and it is' + result.SongID);
            song.songInfo = result;
            //if it is the correct song lets store the song ids in here
            GSS.SongIDs.push(result.SongID);
            break;
        }else{
            console.error('Did not find ', song.songname, ' by ' , song.artist);
        }
    }

    //load this when The search has finished
    if(RSS.songs.length == RSS.entries.length){
        console.log('done');
        createRSSPlaylist();
    
        $("#GSSfinishedBox").fadeIn();
        setTimeout(function(){
            clearLoadingIcon();
            $('#gss_dropdown').toggle();
            $('#GSS').toggleClass('active');
        }, 1000);
    }
}

//creates the playlist on the backend of GS
function createRSSPlaylist(){

    GS.service.createPlaylist(GSS.title, GSS.SongIDs, '', function(result, req){
        var playlistID=result;
        GSS.playlistID = playlistID;
        GSS.timeStamp = Date.parse(Date());
        injectRSSPlaylist(GSS);

        //the name doesn't matter so an arbitrary name LoLoLoL was chosen
        location.hash = "#/playlist/LoLoLoL/"+playlistID;

        //use local storage to store the GSS feeds
        //push the GSS into the GSSFeeds
        GSSFeeds.push(GSS);
        localStorage['GSSFeeds'] = JSON.stringify(GSSFeeds);
    },null);
}

function removePlaylist(playlistID, titleToBeRemoved){
     //remove the playlist from Grooveshark
     GS.service.deletePlaylist(playlistID, titleToBeRemoved, null, null);

     //remove the title from the localStorage
     for (var i = 0; i<GSSFeeds.length; i++){
         if (GSSFeeds[i].title = titleToBeRemoved){
             indexOfTitleToBeRemoved = i;
             break
         }
     }

     if (indexOfTitleToBeRemoved != -1) {
         console.log('removing', titleToBeRemoved);
         GSSFeeds.splice(indexOfTitleToBeRemoved, 1);
         localStorage['GSSFeeds'] = JSON.stringify(GSSFeeds);
     } else {
         console.error('could not find the title in the local storage')
     }
}
//This file contains all the function that pertain to styling and visual elements of the plugin

function injectRSSPlaylist(GSSinfo){
    var playlistID = GSSinfo.playlistID;
    var title = GSSinfo.title;
    var favicon = GSSinfo.favicon;
    console.log('playlist', playlistID);
    console.log('title', title);

    var playlistCSS =  '<li class="sidebar_link sidebar_playlist playlist sidebar_playlist_own gss" rel="' + playlistID + '" title="' + title + '">'
    playlistCSS+=      '<a href="#/playlist/RSSPlaylist/' +  playlistID + '"><span class="icon remove">'
    playlistCSS+=      '</span><span class="icon"></span><span class="label ellipsis">' + title + '</span></a></li>';


    $('#sidebar_playlists').append(playlistCSS);

    //todo fix thix to be more dynamic
    $('[title="' + title + '"] .icon').css('background-image', 'url("'+ favicon +'")');
    $('[title="' + title + '"] .icon').css('background-position', '0 0');

    $('[title="' + title + '"] .remove').css('background-image', '');
    $('[title="' + title + '"] .remove').css('background-position' , '');

    injectRemoveFeed(playlistID);
}

//This will read the rss entries from local storage and see if there has been a change, if so it will update the playlist


//Function to inject the button for grooveshark
function injectMenu(){
    checkExistingFeeds();
    var style = document.createElement('style');
    style.innerText = '#gss_dropdown { display:none; background:#fff; color:#000; width:225px; padding:5px; -moz-border-radius:3px 0 3px 3px; -webkit-border-radius:3px 0 3px 3px; margin-top:-4px; border:1px solid rgba(0,0,0,.25); border-top:none; background-clip:padding-box; }';
    style.innerText += '#GSS.active { margin:1px 1px 0px 2px !important; }';
    style.innerText += '#gss_synced, #gs_unsynced { padding:10px; margin-bottom:10px; font-weight:bold; text-align:center; font-size:11px; -moz-border-radius:2px; -webkit-border-radius:2px; }';
    style.innerText += '#gss_synced { display:none; background:#d8ebf8; color:#3c7abe; } #gs_unsynced { display:block; background:#eee; } #gss_synced span { color:#306399; }';
    style.innerText += '#gss_leave { display:block; color:rgba(60, 122, 190, 0.5); text-align:center; font:normal 10px Arial, sans-serif; margin:6px 0 -2px 0; } #gss_leave:hover { color:rgb(60, 122, 190); text-decoration:underline; }';
    style.innerText += '#gss_join label { font-size:11px; } #gss_join input { width:215px; font-size:13px; border:1px solid #c2c1c1; border-top:1px solid #a8a8a8; padding:5px 4px; -moz-border-radius:2px; -moz-box-shadow:inset 0 1px 2px rgba(0,0,0,0.2); -webkit-border-radius:2px; -webkit-box-shadow:inset 0 1px 2px rgba(0,0,0,0.2); }';
    style.innerText += '#GSSloading { display:block; margin-right:auto; margin-left:auto; }';
    style.innerText += '#GSSloadingBar { display:block; border-radius: 5px; background:#212121; height:20px; width:0px; }';
    style.innerText += '#GSSloadingBox { display: block; border-radius: 5px; background:#F5F5F5 }';
    style.innerText += '#GSSfinishedBox { display:none; position:absolute; padding: 2px 0; width:225px; text-align:center; color:#fff; font-size:16px; }';
    document.body.appendChild(style);

    var syncMenu;
    syncMenu =  '<li class="last">';
    syncMenu += '<div id="GSS" class="btn btn_style1"><span id="gss_label">GSS</span></div>';
    syncMenu += '<div id="gss_dropdown" class="dropdown right">';
    syncMenu += '   <form id="gss_join">';
    syncMenu += '       <label for="groupID">Add an RSS feed: </label><input type="text" name="groupID" />';
    syncMenu += '   </form>';
    syncMenu += '</div></li>';

    $('#userOptions').append(syncMenu);
     $('#GSS').click(function() {
         $('#gss_dropdown').toggle();
         $(this).toggleClass('active'); 
     });

    $('#gss_join').submit(function() {
        var rssURL  = $('input', this).val();
        getRSS(rssURL);
        $('input',this).hide();
        //$('#gss_join').append('<img id="GSSloading" src="http://i.imgur.com/xRiVV.gif"/>');
        $('#gss_join').append('<div id=GSSloadingBox><div id=GSSfinishedBox>Finished!</div><div id=GSSloadingBar></div></div>');
        return false;
     });
     
}

function changeLoadingPercent(loadingPecent){
    $('#GSSloadingBar').css('width',225*(.01)*loadingPecent);
}

function clearLoadingIcon() {
    $('#GSSfinishedBox').remove();
    $('#GSSloadingBox').remove();

    $('#gss_join input').val('');
    $('#gss_join input').show();
}

function injectRemoveFeed(playlistID){
    //this is the code that will run when the user clicks the remove icon
     $('[rel="'+playlistID+'"] .remove').click( function(){

         var titleToBeRemoved = $(this).parent().children('.label').text();
         removePlaylist(playlistID, titleToBeRemoved);

         $(this).parent().remove();
     });
}
