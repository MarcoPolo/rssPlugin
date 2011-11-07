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
