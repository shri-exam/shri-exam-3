//general begin

var downloadSetting = {
    domen: 'http://api-fotki.yandex.ru',
    user: 'aig1001',
    albumId: '63684',
    param: '&format=json&callback=?'
};
var images = [];
var fullImgId;
var next = $('<img/>',{
    src: 'img/next.png',
    class: 'b_gallery-b_showImg-e_next',
    alt: 'next',
    onclick: 'nextFullPhoto()'
})
    .css({
        'position': 'absolute',
        'width': '80px',
        'top': '50%',
        'right': '10px'
    });
var prev = $('<img/>',{
    src: 'img/prev.png',
    class: 'b_gallery-b_showImg-e_prev',
    alt: 'prev',
    onclick: 'prevFullPhoto()'
})
    .css({
        'position': 'absolute',
        'width': '80px',
        'top': '50%'
    });
//general end

$(document).ready(function () {

    downloadImg();

    $(window).hover(
        function () {
            if(fullImgId < images.length - 1) {
                $('.b_gallery-b_showImg').append(next);
            }
            if(fullImgId > 0) {
                $('.b_gallery-b_showImg').append(prev);
            }
        },
        function () {
            next.remove();
            prev.remove();
        }
    );
});

function downloadImg() {
    var url = downloadSetting.domen + "/api/users/"+downloadSetting.user+"/album/"+downloadSetting.albumId+"/photos/?"+downloadSetting.param;
    var dfd = $.Deferred();
    $.getJSON(url,function(data){
        for (var i in data.entries)
        {
//            if(i>15) {break;}
            var reg = /(\d+)$/g;
            var id = reg.exec(data.entries[i].id);
            var imgObj = {
                thumb : data.entries[i].img.S.href,
                fullImg : data.entries[i].img.L.href,
                width : data.entries[i].img.L.width,
                height : data.entries[i].img.L.height,
                id: id[1]
            };
            images.push(imgObj);
            dfd.resolve();
        }

        dfd.done(creatThumbImg());
        dfd.done(showFullImg());
    });
}

//downloadImg end

function creatThumbImg() {

    var thumbImg;

    for(var i in images){
        thumbImg=($('<img/>', {
            src: images[i].thumb,
            class: 'b_gallery-b_thumb-e_img',
            id: i,
            alt: 'photo '+images[i].id,
            onclick: 'showFullImg('+i+')'
        }));
        $('.b_gallery-b_thumb').append(thumbImg);
    }
//    addThumbImg(thumbImg);
}

function showFullImg(index) {

    index = index || 0;

    $('.b_gallery-b_showImg-e_img').remove();

    var fullImg = $('<img/>', {
        src: images[index].fullImg,
        class: 'b_gallery-b_showImg-e_img',
        alt: 'photo '+images[index].id
    })
        .css({
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'margin': '-'+(images[0].height)/2+'px auto auto -'+(images[0].width)/2+'px'
        });

    $('.b_gallery-b_showImg').append(fullImg);
    fullImgId = index;
}