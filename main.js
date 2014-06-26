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
    setPlayerHeight();
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
                            '</p></td><td></div><button class="btn btn-link btn-sm" id="' + response.result.items[i].id.videoId + '"><i class="glyphicon glyphicon-plus"></i></button></td></tr>'
            }
            $('#searchWord').html('&lsaquo; keyword: ' + q + ' &rsaquo;');
            $('#search-container').html(contents);
            // $('#query').val('');
        });
        return false;
    });

    $(document).on('click', '#search-container tr td button', function (){
        list.push(searchResult[$(this).attr('id')]);
        $('#list').append('<tr><td>'+ list[list.length-1].title +'</td><td><button class="btn btn-link btn-sm" style="float:right;"><i class="glyphicon glyphicon-remove"></i></button></td></tr>');
        if(list.length==1) play();
        return false;
    });

    $(document).on('click', '#list tr td button', function(){
        var num = $(this).parent().parent().index();
        list.splice(num, 1);
        $(this).parent().parent().remove();
        if(currentIndex == num) {
            if(list.length == 0){
                player.stopVideo();
                currentIndex = 0;
                player.clearVideo();
            }else{
                currentIndex--;
                $('#next').trigger('click');
            }
        }else if(currentIndex > num){
            currentIndex--;
        }
        return false;
    });
    
    $( window ).resize(function(){
        setPlayerHeight();
        return false;
    });

    function setPlayerHeight(){
        var playerWidth = $( '#player' ).width();
        $('#player').css('height', 9*playerWidth/16);
    };

    function play(){
        var videoId = list[currentIndex].id;
        $('#list tr').removeAttr('class');
        $('#list tr:nth-child(' + (currentIndex + 1) + ')').attr('class', 'success');
        player.loadVideoById(videoId);
    }

    $('#play').click(function (){
        if(list.length == 0) return false;
        else if(currentTime != 0) player.playVideo();
        else play();
        return false;
    });

    $('#pause').click(function (){
        if(list.length == 0) return false;
        player.pauseVideo();
        currentTime = player.getCurrentTime();
        return false;
    });

    $('#stop').click(function (){
        if(list.length == 0) return false;
        currentIndex = 0;
        play();
        player.stopVideo();
        return false;
    });

    $('#next').click(function (){
        if(list.length == 0) return false;
        else if(currentIndex == list.length-1) return false;
        else currentIndex++;
        return play();
    });

    $('#prev').click(function (){
        if(list.length == 0) return false;
        else if(currentIndex == 0) return false;
        else currentIndex--;
        play();
        return false;
    });

});
