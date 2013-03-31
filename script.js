//general begin

var downloadSetting = {
    domen: 'http://api-fotki.yandex.ru',
    user: 'aig1001',
    albumId: '63684',
    param: '&format=json&callback=?'
};
var images = [];
var fullImgWrap,
    fullImg,
    thumb,
    currentImgId,
    winW, winH,
    fullImgWrapW, fullImgWrapH,
    fullImgW, fullImgH,
    thumbW, thumbH;
var thumbLoad = $.Deferred();


$(document).ready(function () {
    currentImgId = getCookie('currentImgId');

    $.when( downloadImg() )
        .done(function(){
            showFullImg(currentImgId);
            creatThumbImg().load(function(){
                centeringThumbImg(currentImgId);
            });
        });

    fullImgWrap = $('.b_gallery-b_showImg');
    thumb = $('.b_gallery-b_thumb');

    var next = $('.b_gallery-b_showImg-e_next');
    var prev = $('.b_gallery-b_showImg-e_prev');

    $(window).hover(
        function () {
            if(currentImgId < images.length - 1) {
                next.css('display','block');
            }
            if(currentImgId > 0) {
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
    console.log('downloadImg');
    var url = downloadSetting.domen + "/api/users/"+downloadSetting.user+"/album/"+downloadSetting.albumId+"/photos/?"+downloadSetting.param;

    var req = $.getJSON(url)
        .success(function( response ){
            for (var i in response.entries)
            {
                if(i>15) {break;}
                var imgObj = {
                    thumb : response.entries[i].img.S.href,
                    fullImg : response.entries[i].img.L.href,
                    width : response.entries[i].img.L.width,
                    height : response.entries[i].img.L.height
                };
                images.push(imgObj);
            }
        })
        .error(function(){
            console.log('getJSON fail !');
            alert('Проблемы с сервером фото!');
        });
    return req;
}

function creatThumbImg() {
    console.log('creatThumbImg');
    var thumbImg;
    for(var i in images){
        thumbImg=($('<img/>', {
            src: images[i].thumb,
            class: 'b_gallery-b_thumb-e_img',
            id: i,
            alt: 'photo '+i,
            onclick: 'shift(null, '+i+')'
        }));
        thumb.append(thumbImg);
    }
    return thumbImg;
}

function showFullImg(index) {
    console.log('showFullImg');
    index = index || 0;

    $('.b_gallery-b_showImg-e_img').remove();

    fullImg = $('<img/>', {
        src: images[index].fullImg,
        class: 'b_gallery-b_showImg-e_img',
        alt: 'photo '+index,
        onload: "getInfo()"
    })
        .css({
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'margin': '-'+(images[index].height)/2+'px auto auto -'+(images[index].width)/2+'px'
        });
    fullImgWrap.append(fullImg);
    setCookie('currentImgId',index);
    currentImgId = Number(index);
}

function shift(how, index) {
    index = index || currentImgId+how;
    console.log('shift to '+index);
    showFullImg(index);
    centeringThumbImg(index);
}

// show/hide thumb begin
$(window).mousemove(function(e) {
    if(!thumb) {return false;}
    winH = $(window).height();
    thumbH = $('.b_gallery-b_thumb').height();
    var y = e.pageY;

    if(winH-y < thumbH) {
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
        thumb.scrollTo((direction < 0)?'-=80px':'+=80px', 30);
    }
};

function scroll() {

    if (window.addEventListener) window.addEventListener("DOMMouseScroll", mouse_wheel, false);
    window.onmousewheel = document.onmousewheel = mouse_wheel;

}
// thumb scroll end

function getInfo() {
    console.log('getInfo');
    fullImgW = fullImg.width();
    fullImgH = fullImg.height();
    return resizeFullImg();
}

function alignFullImg(w, h) {
    fullImg.css('margin','-'+(h/2)+'px auto auto -'+(w/2)+'px');
}

// resizing fullImg begin

$(window).resize(function(){
    resizeFullImg();
});

function resizeFullImg() {
    if(!fullImg) {return false;}

    console.log('resizeFullImg');
    winW = $(window).width();
    winH = $(window).height();
    fullImgWrapW = fullImgWrap.width();
    fullImgWrapH = fullImgWrap.height();
    thumbW = thumb.width();
    thumbH = thumb.height();

    if(fullImgWrapW < fullImgW || fullImgWrapH < fullImgH) {
        if((fullImgW/fullImgH) < (fullImgWrapW/fullImgWrapH)) {
            fullImg.width(fullImgWrapH * (fullImgW/fullImgH));
            fullImg.height(fullImgWrapH);
            alignFullImg((fullImgWrapH * (fullImgW/fullImgH)),fullImgWrapH);
        }else {
            fullImg.width(fullImgWrapW);
            fullImg.height(fullImgWrapW / (fullImgW/fullImgH));
            alignFullImg(fullImgWrapW,(fullImgWrapW / (fullImgW/fullImgH)));
        }
    }else {
        fullImg.width(fullImgW);
        fullImg.height(fullImgH);
        alignFullImg(fullImgW,fullImgH);
    }
}
// resizing fullImg end

// fullImg in coockie begin

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined
}

function setCookie(name, value, props) {
    props = props || {};
    var exp = props.expires
    if (typeof exp == "number" && exp) {
        var d = new Date();
        d.setTime(d.getTime() + exp*1000);
        exp = props.expires = d;
    }
    if(exp && exp.toUTCString) { props.expires = exp.toUTCString() }

    value = encodeURIComponent(value);
    var updatedCookie = name + "=" + value;
    for(var propName in props){
        updatedCookie += "; " + propName;
        var propValue = props[propName];
        if(propValue !== true){ updatedCookie += "=" + propValue }
    }
    document.cookie = updatedCookie;

}
// fullImg in coockie end

function centeringThumbImg(index) {
    console.log('centeringThumbImg '+index);
    var img = $('img#'+index);
    var centerThumb = (thumbW/2);
    var centerImg = (img.width()/2);
    var offset = img.offset().left;
    if(offset < centerThumb) {
        var scroll = centerThumb-offset-centerImg;
        console.log(scroll);
        thumb.scrollTo('-='+scroll, 500);
    }else{
        var scroll = (offset-centerThumb)+centerImg;
        console.log(scroll);
        thumb.scrollTo('+='+scroll, 500);
    }
}