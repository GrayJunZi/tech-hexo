/*声明三个自定义js方法*/
/*不区分大小写的判断包含， 用于搜索文章标题过滤文章*/
jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
};
/*区分大小写的判断包含， 用于搜索文章标题过滤文章*/
jQuery.expr[':'].containsSensitive = function (a, i, m) {
    return jQuery(a).text().indexOf(m[3]) >= 0;
};
/*区分大小写，用于搜索标签过滤文章*/
jQuery.expr[':'].contains_tag = function (a, i, m) {
    var tags = String(jQuery(a).data("tag")).split(",");
    return $.inArray(m[3], tags) !== -1;
};
/*区分大小写，用于搜索作者过滤文章*/
jQuery.expr[':'].contains_author = function (a, i, m) {
    var tags = String(jQuery(a).data("author")).split(",");
    return $.inArray(m[3], tags) !== -1;
};
var blog_path = $('.theme_blog_path').val();
blog_path= blog_path.lastIndexOf("/") === blog_path.length-1?blog_path.slice(0, blog_path.length-1):blog_path;

/*使用pjax加载页面，速度更快，交互更友好*/
var content = $(".pjax");
var container = $(".main-wrapper");
var $searchInput = $("#local-search-input");
var $outlineList = $('#outline-list');
var $localSearchResult = $("#local-search-result")
var isFullScreen = $(window).width() <= 1024
var shortcutKey = $('#theme_shortcut').val() !== 'false'
var pageshortcut = $('#page_shortcut').val() !== 'true' /*为了让某些页面禁用快捷键而单独增加了变量*/
$(document).pjax('.site_url,.nav-item a,.post-card,.hero-btn', '.pjax', {fragment: '.pjax', timeout: 8000});$(document).on({
    /*点击链接后触发的事件*/
    'pjax:click': function () {
        /*原有内容淡出*/
        content.removeClass('fadeIns').addClass('fadeOuts');
        /*请求进度条*/
        NProgress.start();
    },

    /*pjax开始请求页面时触发的事件*/
    'pjax:start': function () {
        content.css({'opacity': 0});
    },

    /*pjax请求回来页面后触发的事件*/
    'pjax:end': function () {
        NProgress.done();
        container.scrollTop(0);
        afterPjax();
    }
});
function afterPjax() {
    // 文章默认背景
    var path = window.location.pathname;
    var blog_path = $('.theme_blog_path').val() || '';
    if (blog_path === '' ? path === '/' : path === blog_path || path === blog_path + '/') {
        container.addClass('index');
    } else {
        container.removeClass('index');
    }

    // 导航栏高亮更新
    $('.nav-item').removeClass('active');
    $('.nav-item a').each(function() {
        var href = $(this).attr('href');
        // 处理各种路径匹配情况，确保高亮正确
        if (path === href || 
            path === href + 'index.html' || 
            (href !== '/' && href !== blog_path && path.indexOf(href) === 0)) {
            $(this).parent().addClass('active');
        }
    });

    // 搜索结果清空
    $localSearchResult.hide().html('');
    $searchInput.val('');

    /*渲染MathJax数学公式*/
    if($("script[type='text/x-mathjax-config']").length>0){
        $.getScript($("#MathJax-js").val(),function () {
            MathJax.Hub.Queue(
                ["resetEquationNumbers",MathJax.InputJax.TeX],
                ["Typeset",MathJax.Hub]
            );
        });
    }

    /*新内容淡入*/
    content.css({'opacity': 1}).removeClass('fadeOuts').addClass('fadeIns');
    bind();
    /*discus获取评论数*/
    if ($(".theme_disqus_on").val() === "true") {
        DISQUSWIDGETS.getCount({reset: true});
    }
    if ($("#comments").hasClass("disqus")) {
        setTimeout(function () {
            if ($(".count-comment").text().trim() === "") {
                $(".count-comment").text(0);
            }
        }, 300);
    }
}


/*快捷键/组合键*/
var publickey = {"shift": false, "ctrl": false, "alt": false, "last": 0};
if (shortcutKey && pageshortcut) {
    $(document).keydown(function (e) {
        var tobottom = container.prop("scrollHeight") - container.scrollTop() - container.height();
        var totop = container.scrollTop();
        if (!$searchInput.is(":focus") && !$tagSearchInput.is(':focus') && !$('#comments textarea').is(':focus')) {
            if (e.keyCode === 74) { /* J */
                container.animate({scrollTop: container.prop("scrollHeight") - container.height()}, tobottom, "linear");
            } else if (e.keyCode === 75) { /* K */
                container.animate({scrollTop: 0}, totop, "linear");
            } else if (e.keyCode === 71) { /* G */
                if (publickey.shift) {
                    container.animate({scrollTop: container.prop("scrollHeight")}, 800);
                } else if (publickey.last === 71) { /* G */
                    container.animate({scrollTop: 0}, 800);
                }
            } else if (e.keyCode === 16) { /* shift */
                publickey.shift = true;
            }
        }
    })

    $(document).keyup(function (e) {
        if (!$searchInput.is(":focus") && !$tagSearchInput.is(':focus') && !$('#comments textarea').is(':focus')) {
            if (e.which === 83) { /* S - 显示/隐藏文章列表 */
                $fullBtn.trigger("click");
            } else if ((e.which === 73 || e.which === 105) && ($(".nav").css('margin-left')==='0px') && !$('.title-list').hasClass('friend')) { /* I */
                 inputChange() //这里禁用了i快捷键
            } else if (e.which === 87) { /* W - 切换大纲视图 */
                if ($outlineList.is(':visible')) {
                    $('#outline-panel > .icon-list').trigger('click')
                } else {
                    if ($('#local-search-result').is(":visible")) {
                        $searchInput.val('')
                        inputChange()
                    }
                    $('#default-panel').hide()
                    $('#title-list-nav').hide()
                    $('#search-panel').hide()
                    $('#outline-panel').show()
                    $outlineList.show()
                    syncOutline(container[0])
                }
                // 如果是全屏，则推出全屏
                if (isFullScreen) {
                    $fullBtn.trigger("click");
                }
                // 如果在友链界面，则推出友链
                if (isFriend) {
                    $('.friends-area .icon-left').trigger('click')
                }

            } else if (e.which === 74 || e.which === 75) { /* J K - 上滑/下滑*/
                container.stop(true);
            } else if (e.which === 16) {
                publickey.shift = false;
            }
        }
        publickey.last = e.keyCode;
    })
}


/*搜索输入框: 回车跳转到第一个搜索结果*/
$searchInput.keydown(function (e) {
    if (e.which === 13) { /* 回车 */
        var $firstResult = $("#local-search-result a:visible:first");
        if ($firstResult.length > 0) {
            $firstResult.trigger("click");
        }
        $(':focus').blur();
    } else if (e.which === 27) { /* esc */
        $(this).val('').blur();
        $("#local-search-result").hide().html('');
    }
});
var clickScrollTo = false
function syncOutline(_this) {
    try{
        if ($('#outline-list .toc-link[href!="#"]').length > 0 && !clickScrollTo) {
            var activeIndex = null
            $('#outline-list .toc-link[href!="#"]').each(function (index) {
                var diff = _this.scrollTop - $(_this).find(decodeURI($(this).attr('href')))[0].offsetTop
                if (diff < -20) {
                    activeIndex = index === 0 ? 0 : index - 1
                    return false
                }
            })
            $('#outline-list .toc-link[href!="#"].active').removeClass('active')
            if (activeIndex === null) {
                $('#outline-list .toc-link[href!="#"]:last').addClass('active')
            } else {
                $('#outline-list .toc-link[href!="#"]:eq(' + activeIndex + ')').addClass('active')
            }
            if ($('#outline-list .toc-link[href!="#"].active')[0].offsetTop - $outlineList.height() - $outlineList[0].scrollTop > -80) {
                $outlineList.scrollTop($('#outline-list .toc-link[href!="#"].active')[0].offsetTop + 80 - $outlineList.height())
            } else if ($('#outline-list .toc-link[href!="#"].active')[0].offsetTop < $outlineList[0].scrollTop) {
                $outlineList.scrollTop($('#outline-list .toc-link[href!="#"].active')[0].offsetTop)
            }
        }
    } catch (e) {
        console.error('同步toc位置失败！', e)
    }
}

$(function () {
    bind();
    // 监测滚动，同步大纲
    container.on('scroll', function () {
        var _this = this
        var $rocket = $("#rocket");
        if (container.scrollTop() >= 200 && $rocket.css("display") === "none") {
            $("#rocket").removeClass("launch").css("display", "block").css("opacity", "0.5");
        } else if (container.scrollTop() < 200 && $rocket.css("display") === "block") {
            $("#rocket").removeClass("launch").css("opacity", "1").css("display", "none");
        }
        syncOutline(_this)
    })

    // 全文搜索初始化
    if ($('#local-search-result').length>0) {
        $.getScript(blog_path + '/js/search.js', function () {
            searchFunc(blog_path + "/search.json", 'local-search-input', 'local-search-result');
        })
    }

    /*回到页首*/
    $("#rocket").on("click", function (e) {
        $(this).addClass("launch");
        container.animate({scrollTop: 0}, 500);
    });

    if ($("#comments").hasClass("disqus")) {
        setTimeout(function () {
            if ($(".count-comment").text().trim() === "") {
                $(".count-comment").text(0);
            }
        }, 1500);
    }
});

/*绑定新加载内容的点击事件*/
function bind() {
    /*渲染高亮代码块结构与样式*/
    if ($('#theme_highlight_on').val() === 'true') {
        $('pre code').each(function (i, block) {
            var $pre = $(this).parent('pre');
            if ($pre.find('.copy-btn').length === 0) {
                var hasCopy = $('#theme_code_copy').val() !== 'false';
                if (hasCopy) {
                    $pre.append('<div class="copy-btn" onclick="copyCode(this)">COPY</div>');
                }
            }
            var codeClass = $(this).attr('class') || '';
            if (codeClass.indexOf('hljs') === -1) {
                hljs.highlightBlock(block);
            }
        });
    }

    // 文章列表排序
    $('.sort-btn').on('click', function() {
        var $btn = $(this);
        var sortType = $btn.data('sort');
        var $grid = $('#home-post-grid');
        var $items = $grid.children('.post-card');

        if ($btn.hasClass('active')) {
            // 切换升降序
            if ($btn.hasClass('desc')) {
                $btn.removeClass('desc').addClass('asc');
            } else {
                $btn.removeClass('asc').addClass('desc');
            }
        } else {
            $('.sort-btn').removeClass('active');
            $btn.addClass('active');
        }

        var isDesc = $btn.hasClass('desc');

        $items.sort(function(a, b) {
            var valA, valB;
            if (sortType === 'date') {
                valA = $(a).data('date');
                valB = $(b).data('date');
                return isDesc ? valB - valA : valA - valB;
            } else if (sortType === 'title') {
                valA = $(a).data('title').toString();
                valB = $(b).data('title').toString();
                return isDesc ? valB.localeCompare(valA, 'zh-CN') : valA.localeCompare(valB, 'zh-CN');
            }
            return 0;
        });

        $grid.append($items);
    });

    // 导航栏点击切换高亮
    $('.nav-left ul li div').on('click', function() {
        $('.nav-left ul li div').removeClass('active');
        $(this).addClass('active');
    });

    // 公告更多展示
    $('#show-more-announce').on('click', function() {
        $('.announce-box').show();
        $(this).hide();
    });

    initArticle();
    $(".article_number").text($("#yelog_site_posts_number").val());
    $(".site_word_count").text($("#yelog_site_word_count").val());
    $(".site_uv").text($("#busuanzi_value_site_uv").text());
    $("#busuanzi_value_site_uv").bind("DOMNodeInserted", function (e) {
        $(".site_uv").text($(this).text())
    });
    $(".site_pv").text($("#busuanzi_value_site_pv").text())
    $("#busuanzi_value_site_pv").bind("DOMNodeInserted", function (e) {
        $(".site_pv").text($(this).text())
    });
    //绑定文章内tag的搜索事件
    $(".pjax article .article-meta .tag a").on("click", function (e) {
        $searchInput.val("#" + $(this).text().trim());
        $searchInput.trigger('input');
    });
    //绑定文章内作者的点击事件
    $(".pjax article .article-meta .author").on("click", function (e) {
        $searchInput.val("@" + $(this).text().trim());
        $searchInput.trigger('input');
    });
    //初始化文章toc
    $("#outline-list").html($(".pjax article .toc-ref .toc").clone());
    $("#outline-list .toc").append($(".pjax article .toc-ref > .toc-item").clone());
    // 修复自定义标题的关联关系
    $("#outline-list").find('.toc-link').each(function() {
        if (!$(this).attr('href')) {
            var tocText = $(this).text().replaceAll(/[^a-zA-Z0-9]/g, '')
            $(this).attr('href', '#' + encodeURIComponent(tocText))
            $(this).parent().attr('class').split(' ').forEach(function (item) {
                if (item.indexOf('toc-level-') !== -1) {
                    $('.main-wrapper').find('h'+item.replace('toc-level-', '')).each(function () {
                        if ($(this).text().replaceAll(/[^a-zA-Z0-9]/g, '') === tocText) {
                            $(this).attr('id', encodeURIComponent(tocText))
                        }
                    })
                }
            })
        }
    })
    syncOutline(container[0])
    //绑定文章toc的滚动事件
    $("a[href^='#']").click(function () {
        var $this = $(this)
        if ($this.parents('#outline-list').length > 0) {
            $('#outline-list .toc-link[href!="#"].active').removeClass('active')
            $this.addClass('active')
        }
        clickScrollTo = true
		    var targetOffsetTop = $(decodeURI($this.attr("href")))[0].offsetTop
        container.animate({scrollTop: container.scrollTop > targetOffsetTop ? (targetOffsetTop + 20) : (targetOffsetTop - 20)}, 500, 'swing', function () {
            clickScrollTo = false
        });
        return false;
    });
    if ($("#comments").hasClass("disqus")) {
        var $disqusCount = $(".disqus-comment-count");
        $disqusCount.bind("DOMNodeInserted", function (e) {
            $(".count-comment").text(
                $this.text().replace(/[^0-9]/ig, "")
            )
        });
    }
    /*给文章中的站内跳转绑定pjax*/
    $(document).pjax('.pjax article a[target!=_blank]', '.pjax', {fragment: '.pjax', timeout: 8000});

    /*初始化 img*/
    if (img_resize !== 'photoSwipe') {
        content.find('img:not([data-ignore])').each(function () {
            if (!$(this).parent().hasClass('div_img')) {
                $(this).wrap("<div class='div_img'></div>");
                var alt = this.alt;
                if (alt) {
                    $(this).after('<div class="img_alt"><span>' + alt + '</span></div>');
                }
            }
            if ($(window).width() > 426) {
                $(this).on("click", function (e) {
                    var _that = $(this);
                    $("body").append('<img class="img_hidden" style="display:none" src="' + this.src + '" />');
                    var img_width = "";
                    var img_height = "";
                    var img_top = "";
                    var img_left = "";
                    if ((this.width / this.height) > (document.body.clientWidth / document.body.clientHeight) && $(".img_hidden").width() > document.body.clientWidth) {
                        img_width = document.body.clientWidth + "px";
                        img_height = this.height * document.body.clientWidth / this.width + "px";
                        img_top = (document.body.clientHeight - this.height * document.body.clientWidth / this.width) / 2 + "px";
                        img_left = "0px";
                    } else if (((this.width / this.height) < (document.body.clientWidth / document.body.clientHeight) && $(".img_hidden").height() > document.body.clientHeight)) {
                        img_width = this.width * document.body.clientHeight / this.height + "px";
                        img_height = document.body.clientHeight + "px";
                        img_top = "0px";
                        img_left = (document.body.clientWidth - this.width * document.body.clientHeight / this.height) / 2 + "px";
                    } else {
                        img_height = $(".img_hidden").height() + "px";
                        img_width = $(".img_hidden").width() + "px";
                        img_top = (document.body.clientHeight - $(".img_hidden").height()) / 2 + "px";
                        img_left = (document.body.clientWidth - $(".img_hidden").width()) / 2 + "px";
                    }
                    $("body").append('<div class="img_max" style="opacity: 0"></div>');
                    $("body").append('<img class="img_max" src="' + this.src + '" style="top:' + $(this).offset().top + 'px;left:' + $(this).offset().left + 'px; width:' + $(this).width() + 'px;height: ' + this.height + 'px;">');
                    $(this).css("visibility", "hidden");
                    setTimeout(function () {
                        $("img.img_max").attr("style", "").css({
                            "top": img_top,
                            "left": img_left,
                            "width": img_width,
                            "height": img_height
                        });
                        $("div.img_max").css("opacity", "1");
                    }, 10);
                    $(".img_max").on("click", function (e) {
                        $("img.img_max").css({
                            "width": _that.width() + "px",
                            "height": _that.height() + "px",
                            "top": _that.offset().top + "px",
                            "left": _that.offset().left + "px"
                        })
                        $("div.img_max").css("opacity", "0");
                        setTimeout(function () {
                            _that.css("visibility", "visible");
                            $(".img_max").remove();
                            $(".img_hidden").remove();
                        }, 500);
                    })
                })
            }
        });
    }

}

/**
 * 复制代码
 */
function copyCode(e) {
    var $code = $(e).siblings('code');
    if (copy($code.text())) {
        $(e).addClass('success').html('SUCCESS');
        setTimeout(function () {
            $(e).removeClass('success').html('COPY');
        }, 1500);
    }
}

// 复制功能1
function copy (text) {
    var isSuccess = false
    var target;
    if (text) {
        target = document.createElement('textarea');
        target.id = 'tempTarget';
        target.style.opacity = '0';
        target.value = text;
        document.body.appendChild(target);
        target.select();
        document.execCommand('copy', true);
        document.body.removeChild(target)
        isSuccess = true
    } else {
        isSuccess = false
    }
    return isSuccess
}
