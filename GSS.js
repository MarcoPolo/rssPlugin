console.log('hello!!');

var GSS = {}
GSS.songs = []


$.getJSON('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=100&key=ABQIAAAAuIlbOmUd3gJTNVDSvX8ZBBThVXKRlugNJ0FXtFSdeFPX98YKrhQMO67lQJHw2mO0gu2r-chAP3vHeg&q=http://feeds2.feedburner.com/PitchforkBestNewTracks&callback=?', function(resp){
	console.log(resp);
	RSS = resp.responseData.feed;
	buildSearchTerms(RSS);
})

function searchForTerms(searchTerms){
	searchTerms.map(function(term){
		GS.service.getSearchResultsEx(term,true, null, function(resp){
			console.log(term);
			console.log(resp.result);
			GSS.songs.push({'title':term, 'results':resp.result});
		}, null)

	});
}

function buildSearchTerms(RSS){
	RSS.entries.map(function(entry){
		searchTerms = [];
		console.log(entry.title.replace('- ',''));
		searchTerms.push(entry.title.replace('- ','').replace('"',''));
		searchForTerms(searchTerms);
	})
}

function addRSSToQueue(){
	GSS.songs.map(function(song){
		if (typeof song.results[0] != 'undefined'){
			console.log('adding ', song.title, ' to queue');
			GS.player.addSongsToQueueAt(song.results[0].SongID,'0',false,'');
		}
	});
}

