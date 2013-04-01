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
    winH,
    thumbW, thumbH,
    next, prev,
    positionFullImg, loadFullImg,
    thumbShow, loadingShow,
    thumbScroll,
    resp, countImgHave;
var lastImg = false;

$(document).ready(function () {
    currentImgId = getCookie('currentImgId');
    var currentImgSrc = getCookie('currentImgSrc');
    fullImgWrap = $('.b_gallery-b_showImg');
    thumb = $('.b_gallery-b_thumb');
    loadFullImg = $('.b_gallery-b_showImg-m_loading');
    loadingShow = 'show';
    next = $('.b_gallery-b_showImg-e_next');
    prev = $('.b_gallery-b_showImg-e_prev');
    var nextShow = 'show';
    var prevShow = 'show';

    $.when( downloadImg() )
        .done(function(){
            redrawArrows(currentImgId);
            creatFullImg(currentImgId, currentImgSrc).load(function(){
                animateFullImg();
                loading('hide', 'fullImg');
                getInfo();
            });
            creatThumbImg('0').load(function(){
                $('img#'+currentImgId).addClass('m_active');
                centeringThumbImg(currentImgId);
            });
        });

    $(document).hover(
        function () {
            if(lastImg == false) {
                if(nextShow == 'hide'){
                    nextShow = 'show';
                    next.animate({opacity: '1.0'},500);
                }
            }
            if(currentImgId > 0) {
                if(prevShow == 'hide'){
                    prevShow = 'show';
                    prev.animate({opacity: '1.0'},500);
                }
            }
        },
        function () {
            if(nextShow == 'show'){
                nextShow = 'hide';
                next.animate({opacity: '0'},500);
            }
            if(prevShow == 'show'){
                prevShow = 'hide';
                prev.animate({opacity: '0'},500);
            }
        }
    );
    var scrl = document.getElementsByClassName('b_gallery-b_thumb');
    if (scrl[0].addEventListener) scrl[0].addEventListener("DOMMouseScroll", mouse_wheel, false);
    scrl[0].onmousewheel = mouse_wheel;
});

//general end

function downloadImg() {
    console.log('downloadImg');
    var url = downloadSetting.domen + "/api/users/"+downloadSetting.user+"/album/"+downloadSetting.albumId+"/photos/?"+downloadSetting.param;
    var i=0;
    var req = $.getJSON(url)
        .success(function( response ){
            for (i in response.entries)
            {
                if(i>20) {break;}
                var imgObj = {
                    thumb : response.entries[i].img.S.href,
                    fullImg : response.entries[i].img.L.href,
                    width : response.entries[i].img.L.width,
                    height : response.entries[i].img.L.height
                };
                images.push(imgObj);
            }
            resp = response;
            countImgHave = Number(i);
        })
        .error(function(){
            console.log('getJSON fail !');
            alert('Проблемы с сервером фото!');
        });
    return req;
}
function reloadingImg(){
    console.log('reloadingImg '+countImgHave);
    for (var i = countImgHave; i < resp.entries.length; i++)
    {
        if(i>(countImgHave+20)) {break;}
        var imgObj = {
            thumb : resp.entries[i].img.S.href,
            fullImg : resp.entries[i].img.L.href,
            width : resp.entries[i].img.L.width,
            height : resp.entries[i].img.L.height
        };
        images.push(imgObj);
    }
    creatThumbImg(countImgHave);
    countImgHave = Number(i);
    console.log(images.length);
}

function creatThumbImg(iStart) {
    thumb.css('bottom', '-'+(thumb.height()*1.5)+'px');
    thumbShow = 'hide';
    var thumbImg;
    for(var i = iStart; i < images.length; i++){
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

function creatFullImg(index, src) {
    index = index || 0;
    src = src || images[index].fullImg;
    fullImg = $('<img/>', {
        src: src,
        class: 'b_gallery-b_showImg-e_img',
        alt: 'photo '+index
    }).css({
            'position': 'absolute',
            'top': '50%'
        });

    if(index > images.length){
        positionFullImg = 'opacity';
        fullImg.css({
            'left': '50%',
            'margin': '-'+(fullImg.height)/2+'px auto auto -'+(fullImg.width)/2+'px',
            'opacity': '0'
        });
    }else{

    if(index < currentImgId){
        positionFullImg = 'left';
        fullImg.css({
            'left': '-'+images[index].width+'px',
            'margin': '-'+(images[index].height)/2+'px auto auto -'+(images[index].width)/2+'px'
        });
    }else if(index > currentImgId){
        positionFullImg = 'right';
        fullImg.css({
            'right': '-'+images[index].width+'px',
            'margin': '-'+(images[index].height)/2+'px -'+(images[index].width)/2+'px auto auto'
        });
    }else{
        positionFullImg = 'opacity';
        fullImg.css({
            'left': '50%',
            'margin': '-'+(images[index].height)/2+'px auto auto -'+(images[index].width)/2+'px',
            'opacity': '0'
        });
    }
    }

    fullImgWrap.append(fullImg);
    setCookie('currentImgSrc', fullImg.attr('src'));
    setCookie('currentImgId', index);
    currentImgId = Number(index);
    return fullImg;
}

function animateFullImg() {
    if(positionFullImg === 'left'){
        fullImg.animate({ left: '50%' }, 500 );
    }else if(positionFullImg === 'right'){
        fullImg.animate({ right: '50%' }, 500 );
    }else{
        fullImg.animate({ opacity: '1.0' }, 500);
    }
}

function shift(how, index) {
    loading('show', 'fullImg');
    index = (index == undefined || index == null)? currentImgId+how:index;
    $('img#'+currentImgId).removeClass('m_active');
    $('img#'+index).addClass('m_active');
    creatFullImg(index).load(function(){
        animateFullImg();
        loading('hide', 'fullImg');
        getInfo();
    });
    redrawArrows(index);
    centeringThumbImg(index);
}

function redrawArrows(index) {
    if(index == 0){
        prev.hide(500);
        next.show(500);
    }else if(lastImg == true){
        next.hide(500);
        prev.show(500);
    }else{
        next.show(500);
        prev.show(500);
    }
}

// show/hide thumb begin
$(window).mousemove(function(e) {
    if(!thumb) {return false;}
    winH = $(window).height();
    thumbH = $('.b_gallery-b_thumb').height();
    var y = e.pageY;

    if(winH-y < thumbH){
        if(thumbShow == 'hide'){
            thumbShow = 'show';
            thumb.animate({ bottom: '0'}, 500);
        }
    } else{
        if(thumbShow == 'show'){
            thumbShow = 'hide';
            thumb.animate({ bottom: '-'+(thumbH*1.5)+'px'}, 500);
        }
    }
});
// show/hide thumb end

// thumb scroll begin
var mouse_wheel = function (event) {
    if (false == !!event) event = window.event;
    var direction = ((event.wheelDelta) ? event.wheelDelta/120 : event.detail/-3) || false;

    if (direction) {
        if(direction < 0){
            thumb.animate({ scrollLeft: '-=80'}, 80);
        }else if(direction > 0){
            thumb.animate({ scrollLeft: '+=80'}, 80);
        }
    }
    if(thumb.scrollLeft() !== 0 && thumbScroll == thumb.scrollLeft()){
        console.log('next');
        reloadingImg();
    }
    thumbScroll = thumb.scrollLeft();
};
// thumb scroll end

function getInfo() {
    var fullImgW = fullImg.width();
    var fullImgH = fullImg.height();
    return resizeFullImg(fullImgW, fullImgH);
}

function alignFullImg(w, h) {
    if(positionFullImg === 'right'){
        fullImg.css('margin','-'+(h/2)+'px -'+(w/2)+'px auto auto');
    }else{
        fullImg.css('margin','-'+(h/2)+'px auto auto -'+(w/2)+'px');
    }
}

// resizing fullImg begin

$(window).resize(function(){
    resizeFullImg();
});

function resizeFullImg(fullImgW, fullImgH) {
    if(!fullImg) {return false;}
    winH = $(window).height();
    var fullImgWrapW = fullImgWrap.width();
    var fullImgWrapH = fullImgWrap.height();
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
    if(index > images.length-1){return false;}
    var img = $('img#'+index);
    var centerThumb = (thumbW/2);
    var centerImg = (img.width()/2);
    var offset = img.offset().left;
    if(offset < centerThumb) {
        var scroll = centerThumb-offset-centerImg;
        thumb.animate({ scrollLeft: '-='+scroll}, 500);
    }else{
        var scroll = (offset-centerThumb)+centerImg;
        thumb.animate({ scrollLeft: '+='+scroll}, 500);
    }
}
function loading(how, when){
    if(when == 'fullImg'){
        if(how == 'show'){
            if(loadingShow == 'hide'){
                    loadingShow = 'show';
                    fullImg.remove();
                    loadFullImg.animate({opacity: '1.0'}, 500);
            }
        }
        if(how == 'hide'){
            if(loadingShow == 'show'){
                    loadingShow = 'hide';
                    loadFullImg.animate({opacity: '0'}, 300);
            }
        }
    }
}