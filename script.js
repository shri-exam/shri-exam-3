//general begin

var downloadSetting = {
    domen: 'http://api-fotki.yandex.ru',
    user: 'aig1001',
    albumId: '63684',
    param: '&format=json&callback=?'
};
var images = [];

var loading = $('<div/>', {
    class: 'b_gallery-b_thumb-e_loading'
});

//general end

$(document).ready(function () {

    $('.b_gallery-b_thumb').append(loading);

    downloadImg();
});

function downloadImg() {
    var url = downloadSetting.domen + "/api/users/"+downloadSetting.user+"/album/"+downloadSetting.albumId+"/photos/?"+downloadSetting.param;
    var dfd = $.Deferred();
    $.getJSON(url,function(data){
        for (var i in data.entries)
        {
            if(i>10) {break;}
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
            alt: 'photo '+images[i].id
        }));
        $('.b_gallery-b_thumb').append(thumbImg);
    }
//    addThumbImg(thumbImg);
}



