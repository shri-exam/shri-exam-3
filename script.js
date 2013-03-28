//general begin

var downloadSetting = {
    domen: 'http://api-fotki.yandex.ru',
    user: 'aig1001',
    albumId: '63684',
    param: '&format=json&callback=?'
};
var images = [];
var showImg;
var thumb;
var fullImg;
var fullImgId;
var fullImgW;
var fullImgH;

$(document).ready(function () {

    downloadImg();

    showImg = $('.b_gallery-b_showImg');
    thumb = $('.b_gallery-b_thumb');

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

//general end

function downloadImg() {
    var url = downloadSetting.domen + "/api/users/"+downloadSetting.user+"/album/"+downloadSetting.albumId+"/photos/?"+downloadSetting.param;
    var dfd = $.Deferred();
    $.getJSON(url,function(data){
        for (var i in data.entries)
        {
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

        creatThumbImg();
        showFullImg(getCookie('fullImgId'));
    });
}

function creatThumbImg() {

    var thumbImg;

    for(var i in images){
        if(i>15){break;}
        thumbImg=($('<img/>', {
            src: images[i].thumb,
            class: 'b_gallery-b_thumb-e_img',
            id: i,
            alt: 'photo '+images[i].id,
            onclick: 'showFullImg('+i+')'
        }));
        thumb.append(thumbImg);
    }
}

function showFullImg(index) {


    index = index || 0;

    $('.b_gallery-b_showImg-e_img').remove();

    var fullImg = $('<img/>', {
        src: images[index].fullImg,
        class: 'b_gallery-b_showImg-e_img',
        alt: 'photo '+images[index].id,
        onload: "getInfoFullImg()"
    })
        .css({
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'margin': '-'+(images[index].height)/2+'px auto auto -'+(images[index].width)/2+'px'
        });

    showImg.append(fullImg);
    fullImgId = index;
    setCookie('fullImgId',fullImgId);
}

function shift(how) {
    showFullImg(fullImgId+how);
}

// show/hide thumb begin

$(window).mousemove(function(e) {
    var y = e.pageY;
    var h = $(window).height();
    var heightThumb = thumb.height();

    if(h-y < heightThumb) {
        thumb.css('marginTop','0');
    } else {
        thumb.css('marginTop','20%');
    }
});

// show/hide thumb end

// thumb scroll begin

var mouse_wheel = function (event) {

    if (false == !!event) event = window.event;
    var direction = ((event.wheelDelta) ? event.wheelDelta/120 : event.detail/-3) || false;

    if (direction) {
        thumb.scrollTo((direction < 0)?'+=80px':'-=80px', 30);
    }
};

function scroll() {

    if (window.addEventListener) window.addEventListener("DOMMouseScroll", mouse_wheel, false);
    window.onmousewheel = document.onmousewheel = mouse_wheel;

}
// thumb scroll end

//align fullImg begin

function getInfoFullImg() {
    fullImg = $('.b_gallery-b_showImg-e_img');
    fullImgW = fullImg.width();
    fullImgH = fullImg.height();
    resizeFullImg();
}
function alignFullImg(w, h) {
    fullImg.css('margin','-'+(h/2)+'px auto auto -'+(w/2)+'px');
}

//align fullImg end


// resizing fullImg begin

$(window).resize(function(){
    resizeFullImg();
});

function resizeFullImg() {
    var winW = showImg.width();
    var winH = showImg.height();

    if(winW < fullImgW || winH < fullImgH) {
        if((fullImgW/fullImgH) < (winW/winH)) {
            fullImg.width(winH * (fullImgW/fullImgH));
            fullImg.height(winH);
            alignFullImg((winH * (fullImgW/fullImgH)),winH);
        }else {
            fullImg.width(winW);
            fullImg.height(winW / (fullImgW/fullImgH));
            alignFullImg(winW,(winW / (fullImgW/fullImgH)));
        }
    }else {
        fullImg.width(fullImgW);
        fullImg.height(fullImgH);
        alignFullImg(fullImgW,fullImgH);
    }
}
// resizing fullImg end

// fullImg in coockie begin
// уcтанавливает cookie

// возвращает cookie если есть или undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
}

// уcтанавливает cookie

function setCookie(name, value, props) {
    props = props || {}
    var exp = props.expires
    if (typeof exp == "number" && exp) {
        var d = new Date()
        d.setTime(d.getTime() + exp*1000)
        exp = props.expires = d
    }
    if(exp && exp.toUTCString) { props.expires = exp.toUTCString() }

    value = encodeURIComponent(value)
    var updatedCookie = name + "=" + value
    for(var propName in props){
        updatedCookie += "; " + propName
        var propValue = props[propName]
        if(propValue !== true){ updatedCookie += "=" + propValue }
    }
    document.cookie = updatedCookie

}

// fullImg in coockie end