//general begin

var downloadSetting = {
    collection: 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/',
    order: 'updated',
    offsetPage: '',
    limitImg: 20,
    format: 'format=json',
    callback: 'callback=?'
};
var images = [];
var countImgHave = -20;
var lastImg = Infinity;

var fullImgWrap,fullImg, positionFullImg, loadFullImg, fullImgW, fullImgH, currentImgId,
    thumb, thumbW, thumbH, thumbShow, thumbScroll,
    winH, next, prev, loadingShow;

var loadingThumb = $('<img/>', {
    src: 'img/loadThumb.gif',
    class: 'b_gallery-b_thumb-m_reloading',
    alt: 'loading...'
}).css({
        'height': '100%',
        'max-height': '100px',
        'marginRight': '10px'
    });

$(document).ready(function () {
    currentImgId = getCookie('currentImgId');
    var currentImgSrc = getCookie('currentImgSrc');
    fullImgWrap = $('.b_gallery-b_showImg');
    thumb = $('.b_gallery-b_thumb');
    thumb.css('bottom', '-'+(thumb.height()*1.5)+'px');
    thumbShow = 'hide';
    loadFullImg = $('.b_gallery-b_showImg-m_loading');
    loadingShow = 'show';
    next = $('.b_gallery-b_showImg-e_next');
    prev = $('.b_gallery-b_showImg-e_prev');
    var nextShow = 'show';
    var prevShow = 'show';
    var url = downloadSetting.collection+downloadSetting.order+'/?limit='+downloadSetting.limitImg+'&'+downloadSetting.format+'&'+downloadSetting.callback;
    $.when( downloadImg(url) )
        .done(function(){
            redrawArrows(currentImgId);
            creatFullImg(currentImgId, currentImgSrc).load(function(){
                animateFullImg();
                loading('hide');
                getInfo();
            });
            creatThumbImg('0').load(function(){
                $('img#'+currentImgId).addClass('m_active');
                centeringThumbImg(currentImgId);
            });
        });

    $(document).hover(
        function () {
            if(currentImgId < lastImg) {
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

function downloadImg(url) {
    console.log('downloadImg');
    var i=0;
    var req = $.getJSON(url)
        .success(function( response ){
            for (i in response.entries)
            {
                var imgObj = {
                    thumb : response.entries[i].img.S.href,
                    fullImg : response.entries[i].img.XL.href,
                    width : response.entries[i].img.XL.width,
                    height : response.entries[i].img.XL.height,
                    updated : response.entries[i].updated
                };
                images.push(imgObj);
            }
            if(i < 19){
                lastImg = images.length-2;
                console.log(lastImg);
            }
            downloadSetting.offsetPage = images[images.length-1].updated;
            countImgHave += Number(downloadSetting.limitImg);
        })
        .error(function(){
            console.log('getJSON fail !');
            alert('Проблемы с сервером фото!');
        });

    return req;
}
function reloadingImg(){
    var dfd = $.Deferred();
    thumb.append(loadingThumb);
    var url = downloadSetting.collection+downloadSetting.order+';'+downloadSetting.offsetPage+'/?limit='+downloadSetting.limitImg+'&'+downloadSetting.format+'&'+downloadSetting.callback;
    $.when( downloadImg(url) )
        .done(function(){
            creatThumbImg(countImgHave).load(function(){
                loadingThumb.remove();
                dfd.resolve();
            });
        });
    return dfd.promise();
}

function creatThumbImg(iStart) {
    iStart = (iStart == 0) ? 0 : (iStart+1);
    iEnd = images.length;
    if(lastImg !== Infinity){ iEnd=lastImg+1; }

    var thumbImg;
    for(var i = iStart; i < iEnd; i++){
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
    loading('show');
    index = (index == undefined || index == null)? currentImgId+how:index;
    if(index >= images.length){
        index += 1;
        reloadingImg().done(function(){
            $('img#'+currentImgId).removeClass('m_active');
            $('img#'+index).addClass('m_active');
            creatFullImg(index).load(function(){
                animateFullImg();
                loading('hide');
                getInfo();
            });
            redrawArrows(index);
            centeringThumbImg(index);
        })
    }else{
    $('img#'+currentImgId).removeClass('m_active');
    $('img#'+index).addClass('m_active');
    creatFullImg(index).load(function(){
        animateFullImg();
        loading('hide');
        getInfo();
    });
    redrawArrows(index);
    centeringThumbImg(index);
    }
}

function redrawArrows(index) {
    if(index == 0){
        prev.hide(500);
        next.show(500);
    }else if(index == lastImg){
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
            thumb.animate({ scrollLeft: '-=80'}, 80, function(){ scrollEnd(); });
        }else if(direction > 0){
            thumb.animate({ scrollLeft: '+=80'}, 80, function(){ scrollEnd(); });
        }
    }
};
var reloading = false;
function scrollEnd() {
    if(thumb.scrollLeft() !== 0 && thumbScroll === thumb.scrollLeft()){
        if(reloading == false && lastImg === Infinity){
            reloading = true;
            reloadingImg().done(function(){reloading = false});
        }
    }
    thumbScroll = thumb.scrollLeft();
}
// thumb scroll end

function getInfo() {
    fullImgW = fullImg.width();
    fullImgH = fullImg.height();
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

function resizeFullImg() {
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
function loading(how){
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