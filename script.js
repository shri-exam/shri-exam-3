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
var lastImg = Infinity;
var indexImg = 0;
var fullImgWrap,fullImg, positionFullImg, loadFullImg, currentImgId,
    thumb, thumbW, thumbH, thumbShow, thumbScroll, fullImgW, fullImgH,
    winH, next, prev, nextVisible, prevVisible, loadingShow;

var loadingThumb = $('<img/>', {
    'src': 'img/loadThumb.gif',
    'class': 'b_gallery-b_thumb-m_reloading',
    'alt': 'loading...'
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
    nextVisible = false;
    prevVisible = false;

    next.on('click', function(){shift(1)});
    prev.on('click', function(){shift(-1)});

    var url = downloadSetting.collection+downloadSetting.order+'/?limit='+downloadSetting.limitImg+'&'+downloadSetting.format+'&'+downloadSetting.callback;

    $.when( downloadImg(url) )
        .done(function(){
            redrawArrows(currentImgId, false);

            creatFullImg(currentImgId, currentImgSrc).on('load', function() {fullImgLoad()});

            creatThumbImg(0).load(function(){
                $('img#'+currentImgId).addClass('m_active');
                centeringThumbImg(currentImgId);
            });
        });

    $(document).hover(
        function () {
            redrawArrows(currentImgId, true);
        },
        function () {
            redrawArrows(currentImgId, false);
        }
    );

    if(document.getElementsByClassName == undefined) {                      // Для IE
        var scrl = document.getElementsByClassName = function(cl) {
            var retnode = [];
            var myclass = new RegExp('\\b'+cl+'\\b');
            var elem = this.getElementsByTagName('*');
            for (var i = 0; i < elem.length; i++) {
                var classes = elem[i].className;
                if (myclass.test(classes)) {
                    retnode.push(elem[i]);
                }
            }
            return retnode;
        }
    }else{
        var scrl = document.getElementsByClassName('b_gallery-b_thumb');
    }

    if(window.addEventListener) {
        scrl[0].addEventListener("DOMMouseScroll", mouse_wheel, false);
    }
    window.onmousewheel = document.onmousewheel = mouse_wheel;

});

//general end

function downloadImg(url, iStart) {
    iStart = iStart || 0;
    var req = $.getJSON(url)
        .success(function( response ){
            for (var i = iStart; i < response.entries.length; i++)
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
            }
            downloadSetting.offsetPage = ';'+images[images.length-1].updated;
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
    var url = downloadSetting.collection+downloadSetting.order+downloadSetting.offsetPage+'/?limit='+downloadSetting.limitImg+'&'+downloadSetting.format+'&'+downloadSetting.callback;

    $.when( downloadImg(url, 1) )
        .done(function(){
            creatThumbImg().load(function(){
                loadingThumb.remove();
                dfd.resolve();
            });
        });
    return dfd.promise();
}

function creatThumbImg(iStart) {
    var thumbImg;
    for(var i = indexImg; i < images.length; i++){
        thumbImg=($('<img/>', {
            'src': images[i].thumb,
            'class': 'b_gallery-b_thumb-e_img',
            'id': i,
            'alt': 'photo '+i,
            'onclick': 'shift(null, '+i+')'
        }));
        thumb.append(thumbImg);
        indexImg = i+1;
    }
    return thumbImg;
}

function creatFullImg(index, src) {
    index = index || 0;
    src = src || images[index].fullImg;
    fullImg = $('<img/>', {
        'src': src,
        'class': 'b_gallery-b_showImg-e_img',
        'alt': 'photo '+index
    }).css({
            'position': 'absolute',
            'top': '50%'
        });

if(index < images.length){
    fullImgW = images[index].width;
    fullImgH = images[index].height;
}

    if(index < currentImgId){
        positionFullImg = 'left';
        fullImg.css({
            'left': '-'+fullImgW+'px',
            'margin': '-'+(fullImgH)/2+'px auto auto -'+(fullImgW)/2+'px'
        });
    }else if(index > currentImgId){
        positionFullImg = 'right';
        fullImg.css({
            'right': '-'+fullImgW+'px',
            'margin': '-'+(fullImgH)/2+'px -'+(fullImgW)/2+'px auto auto'
        });
    }else{
        positionFullImg = 'opacity';
        fullImg.css({
            'left': '50%',
            'opacity': '0'
        });
    }

    fullImgWrap.append(fullImg);
    setCookie('currentImgId', index);
    setCookie('currentImgSrc', src);
    currentImgId = Number(index);
    return fullImg;
}

function fullImgLoad() {
    fullImgW = fullImg.width();
    fullImgH = fullImg.height();

    animateFullImg();
    loading('hide');
    resizeFullImg();
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
        reloadingImg().done(function(){
            $('img#'+currentImgId).removeClass('m_active');
            $('img#'+index).addClass('m_active');
            creatFullImg(index).on('load', function() {fullImgLoad()});
            redrawArrows(index);
            centeringThumbImg(index);
        })
    }else{
    $('img#'+currentImgId).removeClass('m_active');
    $('img#'+index).addClass('m_active');
    creatFullImg(index).on('load', function() {fullImgLoad()});
    redrawArrows(index);
    centeringThumbImg(index);
    }
}

function redrawArrows(index, visible) {

    if(visible === false){
        if(index > images.length-1){
            nextVisible = false;
            prevVisible = false;
            next.hide(500);
            prev.hide(500);
        }
        if(nextVisible === true){
            nextVisible = false;
            next.animate({opacity: '0'},500);
        }
        if(prevVisible === true){
            prevVisible = false;
            prev.animate({opacity: '0'},500);
        }
    }else{
        if(index > images.length-1){
            nextVisible = false;
            prevVisible = false;
            next.hide(500);
            prev.hide(500);
        }else if(index == 0){
            prevVisible = false;
            nextVisible = true;
            prev.hide(500);
            next.animate({opacity: '1.0'},500);
            next.show(500);
        }else if(index == lastImg){
            nextVisible = false;
            prevVisible = true;
            next.hide(500);
            prev.animate({opacity: '1.0'},500);
            prev.show(500);
        }else{
            nextVisible = true;
            prevVisible = true;
            next.animate({opacity: '1.0'},500);
            next.show(500);
            prev.animate({opacity: '1.0'},500);
            prev.show(500);
        }
    }

}

// show/hide thumb begin
$(document).mousemove(function(e) {
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

function deleteCookie(name) {
    setCookie(name, null, { expires: -1 })
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