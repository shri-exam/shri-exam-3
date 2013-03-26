//general begin

var downloadSetting = {
    domen: 'http://api-fotki.yandex.ru',
    user: 'aig1001',
    albumId: '63684',
    param: '&format=json&callback=?'
};
var images = [];
var fullImgId;
var heightWindow;

//general end

$(document).ready(function () {

    heightWindow = $(window).height();

    downloadImg();
    var next = $('.b_gallery-b_showImg-e_next');
    var prev = $('.b_gallery-b_showImg-e_prev');
    $(window).hover(
        function () {

            if(fullImgId < images.length - 1) {
                next.css('display','block');
            }
            if(fullImgId > 0) {
                prev.css('display','block');
            }
        },
        function () {
            next.css('display','none');
            prev.css('display','none');
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

// show/hide thumb begin

$(window).mousemove(function(e) {
    var y = e.pageY;
    var h = $(window).height();
    var heightThumb = $('.b_gallery-b_thumb').height();
//    alert(heightWindow+'-'+y+'<'+$('.b_gallery-b_thumb').height());

    if(h-y < heightThumb) {
        $('.b_gallery-b_thumb').css('marginTop','0');
//        showThumb();
    } else {
        $('.b_gallery-b_thumb').css('marginTop','20%');
//        hideThumb();
    }
});

// show/hide  thumb end