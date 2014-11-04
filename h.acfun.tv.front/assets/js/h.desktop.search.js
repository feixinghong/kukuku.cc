/**
 * Created by koukuko on 2014/11/4.
 */


function unix_to_datetime(time) {
    var trans;

    trans = function (t) {
        var dayAgo, dt, dtNow, hrAgo, hrMin, longAgo, longLongAgo, minAgo, secAgo, ts, tsDistance, tsNow;
        dt = new Date(t);
        ts = dt.getTime();
        dtNow = new Date;
        tsNow = dtNow.getTime();
        tsDistance = tsNow - ts;
        hrMin = dt.getHours() + ":" + (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes() + ":" + (dt.getSeconds() < 10 ? "0" : "") + dt.getSeconds();
        longAgo = dt.getMonth() + 1 + "/" + dt.getDate() + " " + hrMin;
        longLongAgo = dt.getFullYear() + "/" + longAgo;
        return longLongAgo;
    }
}

$(document).ready(function () {

    var template = $('.h-threads-item').html();
    var encodedStr = function (char) {
        return char.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    };


    window.result = {};

    var urlParams;
    var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);

    if (!urlParams.q) {
        $('.h-loading .uk-progress').slideUp(100);
        $('.h-loading .uk-text-center').text('没有结果');
    }

    var keyword = '&q=' + urlParams.q;
    var pageNo = (urlParams.page) ? ('&pageNo=' + urlParams.page) : '&pageNo=1';
    var forum = (urlParams.forum) ? ('&forum=' + urlParams.forum) : '';

    $('[name="q"]').val(urlParams.q);
    if (forum) {
        $('[name="forum"]').val(urlParams.forum);
    }

    $.getScript('http://search.acfun.tv/h?pageSize=20&cd=1&format=result' + pageNo + forum + keyword)
        .done(function () {

            $('.h-loading .uk-progress').slideUp(100);

            if (typeof result == 'object' && result.status == '200') {
                var data = result.data;
                $('.h-loading .uk-text-center').text('搜索完成，共有 ' + result.data.totalCount + ' 个结果。').removeClass('uk-text-center');
            } else if (typeof result == 'object') {
                return $('.h-loading .uk-text-center').text('搜索失败:' + result.msg);
            } else {
                return $('.h-loading .uk-text-center').text('搜索失败:服务器返回了错误的结果');
            }

            var html = '';

            for (var i in result.data.list) {

                var item = result.data.list[i];

                var tempHtml = template
                    .replace('%uid%', item.uid)
                    .replace('%name%', item.name ? encodedStr(item.name) : '无名氏')
                    .replace('%email%', item.email == 'sage' ? '' : item.email)
                    .replace('%title%', item.title ? encodedStr(item.title) : '无标题')
                    .replace('%content%', item.content)
                    .replace('%updatedAt%', unix_to_datetime(item.updatedAt))
                    .replace('%id%', item.id);
                if (item.image && item.thumb) {
                    tempHtml = tempHtml
                        .replace('%image%', item.image)
                        .replace('%thumb%', item.thumb)
                } else {
                    tempHtml = tempHtml
                        .replace(/\<div class=\"h\-threads\-img\-box\"\>(.*?)class\=\"h\-threads\-img\"\>\<\/a\>\<\/div\>/g, '');
                }

                if (!item.sage || item.sage == 'false') {
                    tempHtml = tempHtml
                        .replace('<div class="h-threads-tips uk-text-danger uk-text-bold"><i class="uk-icon-lock"></i>&nbsp;本串已经被锁定 (<abbr data-uk-tooltip="{pos:\'right\'}" title="该串不允许被回复">?</abbr>)</div>', '');
                }

                if (!item.lock || item.lock == 'false') {
                    tempHtml = tempHtml
                        .replace('<div class="h-threads-tips uk-text-danger uk-text-bold"><i class="uk-icon-thumbs-down"></i>&nbsp;本串已经被SAGE (<abbr data-uk-tooltip="{pos:\'right\'}" title="该串不会因为新回应而被顶到页首">?</abbr>)</div>', '');
                }

                html += tempHtml;
            }

            $('.h-threads-list').html(html).slideDown(100);

            initImageBox();
            initContent();


        })
        .fail(function () {
            $('.h-loading .uk-progress').slideUp(100);
            $('.h-loading .uk-text-center').text('搜索失败');
        });


});