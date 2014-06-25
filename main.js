var player;

function onClientLoad() {
    gapi.client.load('youtube', 'v3', function(){
        gapi.client.setApiKey('AIzaSyCVCCs_f8WL4Tc13Xak7K76BAs9gXwF1N0');
        $('#search-button').attr('disabled', false);
    });
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: 640,
        height: 360,
        events: {
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerStateChange(e){
    if(e.data == YT.PlayerState.ENDED) $('#next').trigger('click');
}

$(function(){
    var currentTime, currentIndex = 0, list = [], searchResult={};
    
    $('#query').focus();
    
    $('#searchForm').submit(function () {
        var q = $('#query').val();
        if(q == '') return false;
        var request = gapi.client.youtube.search.list({
            q: q,
            part: 'snippet',
            maxResults: 30,
            type: 'video',
            order: 'relevance',
            safeSearch: 'strict'
        });
        request.execute(function (response){
            var contents = '';
            searchResult ={};
            for(var i=0; i<response.result.items.length;i++){
                searchResult[response.result.items[i].id.videoId] = {
                    id: response.result.items[i].id.videoId,
                    title: response.result.items[i].snippet.title,
                    description: response.result.items[i].snippet.description,
                    imgUrl: response.result.items[i].snippet.thumbnails.default.url
                };
                contents += '<tr><td><div class="searchResultList"><img src="' + 
                            response.result.items[i].snippet.thumbnails.default.url + '" width="120px" style="float:left;"><p><b>Title:</b> ' + 
                            response.result.items[i].snippet.title +
                            '<p><b>Description:</b> ' + response.result.items[i].snippet.description +
                            '</p></td><td></div><button class="btn btn-default btn-sm" id="' + response.result.items[i].id.videoId + '"><i class="glyphicon glyphicon-plus"></i></button></td></tr>'
            }
            $('#searchWord').html('&lsaquo; keyword: ' + q + ' &rsaquo;');
            $('#search-container').html(contents);
            // $('#query').val('');
            console.log(response.result.items);
        });
        return false;
    });

    $(document).on('click', '#search-container tr td button', function (){
        list.push(searchResult[$(this).attr('id')]);
        $('#list').append('<tr><td>'+ list[list.length-1].title +'</td></tr>');
        if(list.length==1) play();
        return false;
    });

    function play(){
        var videoId = list[currentIndex].id;
        $('#list tr').removeAttr('class');
        $('#list tr:nth-child(' + (currentIndex + 1) + ')').attr('class', 'success');
        player.loadVideoById(videoId);
    }

    $('#play').click(function (){
        if(currentTime != 0) player.playVideo();
        else play();
        return false;
    });

    $('#pause').click(function (){
        player.pauseVideo();
        currentTime = player.getCurrentTime();
        return false;
    });

    $('#stop').click(function (){
        currentIndex = 0;
        play();
        player.stopVideo();
        return false;
    });

    $('#next').click(function (){
        if(currentIndex == list.length-1) return false;
        else currentIndex++;
        play();
    });

    $('#prev').click(function (){
        if(currentIndex == 0) return false;
        else currentIndex--;
        play();
    });

});