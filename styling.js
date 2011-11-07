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
