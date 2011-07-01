console.log('hello!!');

var GSS = {}
//var rssURL = 'http://feeds2.feedburner.com/PitchforkBestNewTracks' 
var rssURL = 'http://hypem.com/feed/popular/3day/1/feed.xml' 
var rssURL = 'http://hypem.com/feed/time/today/1/feed.xml'
GSS.songs = []
GSS.SongIDs = []



function getRSS(){
    $.getJSON('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=100&key=ABQIAAAAuIlbOmUd3gJTNVDSvX8ZBBThVXKRlugNJ0FXtFSdeFPX98YKrhQMO67lQJHw2mO0gu2r-chAP3vHeg&q='+rssURL+'&callback=?', function(resp){
        console.log(resp);
        RSS = resp.responseData.feed;
        GSS.rssTitle = RSS.title;

        buildSearchTerms(RSS);
    })
}

function makeComparable(name){
    if(name.indexOf('&amp') != -1){
        name = name.replace(' &amp','');
    }

    name = name.replace(/[^a-zA-Z 0-9]+/g,'').toLowerCase();

    return name;
}

function searchForTerms(searchTerms){
	searchTerms.map(function(term){
        searchTerm = (term[0]) + ' ' + term[1];
        GS.service.getSearchResultsEx(searchTerm, true, null, function(resp){
            console.log(searchTerm);
            console.log(resp.result);
            GSS.songs.push({'artist':makeComparable(term[0]), 'songname':term[1], 'results':resp.result, songInfo:''});
        }, null)



	});

}

function buildSearchTerms(RSS){
    console.log('starting')
	var a = RSS.entries.map(function(entry){
        console.log('innn');
		searchTerms = [];
		console.log(entry.title.replace('"',''));
		searchTerms.push(entry.title.replace(/"/g,'').split(' - '));

		searchForTerms(searchTerms);

        console.log('starting')
	});

    console.log('done');

    checkResults();
    
}

function addRSSToQueue(){
	GSS.songs.map(function(song){
            if (typeof song.songInfo.SongID != 'undefined'){
                console.log('adding ', song.songname, ' to queue');
                console.log('with song id', song.songInfo.SongID);
                GS.player.addSongsToQueueAt(song.songInfo.SongID,'0',false,'');
            }
    });
}

function createRSSPlaylist(){
    var playlistID;

    GS.service.createPlaylist(GSS.title, GSS.SongIDs, 'RSS playlist', function(result, req){playlistID=result},null)
    console.log(playlistID);
}


function checkResults(){
    GSS.songs.map(function(song){
        if(typeof song.results[0] != 'undefined' ){
            song.results.map(function(result){
                if((makeComparable(result.ArtistName) == makeComparable(song.artist)) && (makeComparable(result.SongName) == makeComparable(song.songname)) ){
                    console.log('found the correct result and it is' + result);
                    song.songInfo = result;
                }else{
                    console.error('Did not find ', song.songname, ' by ' , song.artist);
                }
            });
        }
    });

    GSS.songs.map(function(song) { GSS.SongIDs.push(song.songInfo.SongID) });
}

getRSS()
