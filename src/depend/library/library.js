define([
    'require',
    'jquery',
    'artDialog'
], function(require, $, dialog) {
    var exports = {};
    
    exports.getParam = getParam;
    exports.getParam2 = getParam2;
    exports.setParam = setParam;
    exports.setParam2 = setParam2;
    exports.removeParam = removeParam;
    
    exports.post = post;
    exports.get = get;
    exports.getLocalData = getLocalData;
    exports.setLocalData = setLocalData;
    exports.getCookie = getCookie;

    exports.setTimeout = _setTimeout;
    exports.setInterval = _setInterval;
    
    exports.redirect = redirect;
    exports.redirect2 = redirect2;
    exports.redirectClient = redirectClient;
    exports.onNavBtnClick = onNavBtnClick;
    exports.historyBack = historyBack;
    exports.openUrl = openUrl;
    
    exports.showTip = showTip;
    exports.showErrorTip = showErrorTip;
    exports.showDialog = showDialog;
    exports.showLoading = showLoading;
    exports.hideLoading = hideLoading;
    exports.confirm = _confirm;
    
    exports.closeWebView = closeWebView;
    exports.closeAllWebView = closeAllWebView;
    exports.setTitle = setTitle;
    exports.checkWXAgent = checkWXAgent;

    exports.init = init;
    
    var isInit = true;
    var isForward = true;
    var loadDialog;
    var isIOS = navigator.userAgent.match(/iphone|ipod|ipad/ig);

    //+++++++++++++++++++++++++++ hash 参数控制 +++++++++++++++++++++++++++++++++++++

    /**
     * js获取url参数的值，(函数内部decodeURIComponent值)
     * @author benzhan
     * @param {string} name 参数名
     * @return {string} 参数值
     */
    function getParam(name) {
        //先获取#后面的参数
        var str = document.location.hash.substr(2);
        var value = getParam2(name, str);
        if (value == null) {
            str = document.location.search.substr(1);
            value = getParam2(name, str);
        }

        return value;
    };

    function getParam2(name, str) {
        //获取参数name的值
        var reg = new RegExp("(^|!|&|\\?)" + name + "=([^&]*)(&|$)");

        //再获取?后面的参数
        r = str.match(reg);
        if (r != null) {
            try {
                return decodeURIComponent(r[2]);
            } catch (e) {
                console.log(e + "r[2]:" + r[2]);
                return null;
            }
        }
        return null;
    }

    /**
     * js设置url中hash参数的值, (函数内部encodeURIComponent传入的value参数)
     * @author benzhan
     * @param {string} name 参数名
     * @return {string} value 参数值
     */
    function setParam(name, value, causeHistory) {
        var search = document.location.search.substr(1);
        if ($.type(name) === "object") {
            // 支持 setParam(value, causeHistory)的写法
            causeHistory = value;
            value = name;
            
            for (var key in value) {
            	search = setParam2(key, value[key], search);
            }
        } else {
        	search = setParam2(name, value, search);
        }

        if (causeHistory) {
        	if (history.pushState) {
        		history.pushState({}, null, "?" + search);
        	} else {        		
        		document.location.search = search;
        	}
        } else {
            if (history.replaceState) {
                console.log(search)
                history.replaceState({}, null, "?" + search);
            } else {
                console.error("history.replaceState:" + history.replaceState);
            }
        }
    };
    
    function setParam2(name, value, str) {
        if ($.type(name) === "object") {
            // 支持 setParam(value, causeHistory)的写法
            str = value;
            value = name;
            for (var key in value) {
               str = setParam2(key, value[key], str);
            }
            return str;
        } else {
            var prefix = str ? "&" : "";
            var reg = new RegExp("(^|!|&|\\?)" + name + "=([^&]*)(&|$)");
            r = str.match(reg);
            value = encodeURIComponent(value);
            if (r) {
                if (r[2]) {
                    var newValue = r[0].replace(r[2], value);
                    str = str.replace(r[0], newValue);
                } else {
                    var newValue = prefix + name + "=" + value + "&";
                    str = str.replace(r[0], newValue);
                }
            } else {
                var newValue = prefix + name + "=" + value;
                str += newValue;
            }
            
            return str;
        }
    }

    /**
     * 删除锚点后的某个参数
     * @author benzhan
     * @param {string} name 参数名
     */
    function removeParam(name, causeHistory) {
        var search = document.location.search.substr(1);
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        r = search.match(reg);
        if (r) {
        	if (r[1] && r[3]) {
        		search = search.replace(r[0], '&');
        	} else {
        		search = search.replace(r[0], '');
        	}
        }
        
        if (causeHistory) {
            document.location.search = search;
        } else {
            if (history.replaceState) {
                history.replaceState({}, null, "?" + search);
            } else {
                console.error("history.replaceState:" + history.replaceState);
            }
        }
    };
    
    function parseHash(strUrl) {
        strUrl = strUrl ? strUrl : document.location.search.substr(1);
        
        //获取参数name的值
        var reg = new RegExp("(^|!|#|&|\\?)(\\w*)=([^&]*)", "g");
        
        //先获取#后面的参数
        var r = reg.exec(strUrl);
        var datas = {};
        
        var i = 0;
        while (r != null) {
            datas[r[2]] = decodeURIComponent(r[3]);
            r = reg.exec(strUrl);            
        }
        
        return datas;
    };
 // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// +++++++++++++++++++++++++++ get 和 post +++++++++++++++++++++++++++++++++++++   
    function _getDefaultData(data) {
        data = data || {};

        var ouid = getCookie('ouid');
        ouid && (data.ouid = ouid);
        
        var defaultKeys = [];
        for (var i in defaultKeys) {
        	var value = getLocalData(defaultKeys[i]);
        	if (value && value != "undefined") {
        		data[defaultKeys[i]] = value;
        	}
        }
        
        for (var k in data) {
            var v = data[k];
            if (v == null || typeof v === 'undefined') {
                delete data[k];
            } else {
                if (typeof v === 'string') {
                    data[k] = $.trim(v);
                }
            }
        }
        
        return data;
    }

    function post(url, data, callback, option) {
        option = option || {};
        // 支持postCross(url, callback)的写法;
        if ( typeof data == 'function') {
            option = callback || {};
            callback = data;
            data = {};
        }

        data = _getDefaultData(data);
        if (window.KLCommon && KLCommon.post) {
            KLCommon.post(url, data, function(objResult) {
                _handleResult(callback, objResult);
            }, option);
        } else {
            var xhr = new XMLHttpRequest();
            BDY.xhrs.push(xhr);
            BDY.xhrCount++;

            xhr.index = BDY.xhrs.length;
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.withCredentials = true;
            // 兼容ios6.0会缓存
            if (window.KalaGame) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
            }
            data = $.param(data);
            
            //获取cache的key
            if (option['cache']) {
                var cacheKey = 'ajaxCache-' + url + '?' + data;
                //如果有cache则不出现loading
                var isCached = _loadAjaxCache(cacheKey, callback);
                if (isCached) {
                    option['loading'] = false;
                    if (option['cache'] == "must") {
                        return;
                    }
                }
            }
            
            if (option['loading']) {
                xhr.timeout = 15000;
                showLoading();
            }
            
            xhr.send(data);
            xhr.ontimeout = option['onTimeout'] || function () {
                callback && callback({result:0, code:-11, msg:"网络超时，请重试"});
            };
        
            // 响应处理
            xhr.onload = function() {
                BDY.xhrs[xhr.index] = null;
                BDY.xhrCount--;

                option['loading'] && hideLoading();
                var objResult = _getAjaxResult(xhr.responseText);
                if (objResult['result'] && option['cache']) {
                    var cache = localStorage.getItem(cacheKey);
                    if (cache && cache == xhr.responseText) {
                        // 网络返回跟缓存一致
                        return;
                    } else {
                        localStorage.setItem(cacheKey, xhr.responseText);
                    }
                }
                
                _handleResult(callback, objResult);
            };
        }
    }

    function get(url, callback, option) {
        option = option || {};
        
        if (window.KLCommon && KLCommon.get) {
            KLCommon.get(url, callback, option);
        } else {
            var xhr = new XMLHttpRequest();
            BDY.xhrs.push(xhr);
            BDY.xhrCount++;

            xhr.url = url;
            option['loading'] && showLoading();
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) {
                    return;
                }

                BDY.xhrs[xhr.index] = null;
                BDY.xhrCount--;
                
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && location.protocol == 'file:')) {
                    option['loading'] && hideLoading();
                    if (option['type'] == 'json') {
                    	callback(_getAjaxResult(xhr.responseText)); 
                    } else {
                    	callback(xhr.responseText);                    	
                    }
                }
            };
            xhr.open("GET", url);
            xhr.withCredentials = true;
            xhr.send();
        }
    }

    function _getAjaxResult(text) {
        var objResult = {};
        var objError = {
            result : 0,
            msg : "系统繁忙，请稍后再试！"
        };

        try {
            objResult = JSON.parse(text);
            if (typeof objResult !== 'object' || objResult === null) {
                objResult = objError;
            }
        } catch (ex) {
            //非json的处理
            objResult = objError;
        }

        return objResult;
    }
    
    function _loadAjaxCache(cacheKey, callback) {
        var cache = localStorage.getItem(cacheKey);
        if (cache) {
            var objResult = JSON.parse(cache);
            objResult._fromCache = true;
            _handleResult(callback, objResult);
            
            return true;
        } else {
            return false;
        }
    }

    function _handleResult(callback, objResult) {

        //session_id失效，重新验证登录
        if(!objResult.result && objResult.code == -5) {
            openLogin();
        } else {
            callback && callback(objResult);
        }
    }
    
    function _deserialize(value){
        if (typeof value != 'string') {
            return undefined
        }
        try {
            return JSON.parse(value)
        }catch(e) {
            return value || undefined
        }
    }

    function getLocalData(key) {
        return getParam(key) || _deserialize(localStorage.getItem(key));
    }


    function setLocalData(key, val) {
        localStorage.setItem(key, JSON.stringify(val))
    }
    
    function getCookie(name) { 
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]); 
        else 
            return null; 
    } 

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    
    /**
     * 设置定时器
     * @param callback 定时器触发的函数
     * @param timeout 执行callback前的时间
     */
    function _setTimeout(callback, timeout) {
        var timer = setTimeout(callback, timeout);
        BDY.timeout.push(timer);
        return timer;
    }

    function _setInterval(callback, timeout) {
        var timer = setInterval(callback, timeout);
        BDY.interval.push(timer);
        return timer;
    }
    
    // 清除页面资源
    function _clearRes() {
        var len;
        var timeout = BDY.timeout;
        var interval = BDY.interval;
        len = timeout.length;
        for (var i = 0; i < len; i++) {
            clearTimeout(timeout[i]);
        }

        len = interval.length;
        for (var i = 0; i < len; i++) {
            clearInterval(interval[i]);
        }

        // 重置timer
        BDY.timeout = [];
        BDY.interval = [];

        for (var i in BDY.xhrs) {
            BDY.xhrs[i] && BDY.xhrs[i].abort();
        }

        BDY.xhrs = [];
        BDY.xhrCount = 0;
    }
    
    
    // ++++++++++++++++++++++++++++++++ 业务逻辑 +++++++++++++++++++++++++++++++++++++
    var pages = {}, oldPage;

    function init() {
        // 这里巨坑
        if (!document.body) {
            setTimeout(init, 10);
            console.warn("webview is slow, setTimeout(init, 10)");
        }
                
        _initEvent();
        _initUrl();

        var isLogining =  false;
        // if (!getCookie('ouid')){
        // 	var isLogining =  tryAutoLogin();
        // }

        if (!isLogining) {
            // if(!getParam("openId")) {
            //     setParam({
            //         "openId": "ohmWUuAW-aIOdFVz6z9GXL3wBlXA",
            //         "customerId": "273"
            //     })
            // }
            // 初始化入口页面
            var page = getParam("page");
            if (!page) {
                setParam("page", "test-index", true);
            } else {
                var $child = $("#container").children();
                if (!$child.length) {
                    console.log('$child.length:' + $child.length);
                    _redirectPage(page);                
                } else {
                    isInit = false;
                    changeNav(page);
                }
            }
        }
    }
    
    init();
       
    function _initEvent() {
        // 点击事件
        $('body').off(BDY.click + ".data-href").on(BDY.click + ".data-href", '[data-href]', function() {
            var $this = $(this);
            
            var href = $this.attr('data-href') || $this.attr('href');
            var clientParam = $this.attr('data-client');
            if (clientParam != null) {
                redirectClient(href, clientParam);
            } else {
                redirect(href);
            }

            return false;
        });

        window.onpopstate = function(event) {
            // 支持onpopstate
            var count = 0;
            for (var page in pages) {
                if (count++ > 1) {
                    break;
                };
            }

            // 防止首次进入就触发onpopstate导致再次刷新
            if (count > 1) {
                var newPage = getParam('page') || 'user-center';
                _redirectPage(newPage);
            }

    	};
        
        _initActiveEvent();
    }
    
    function _initActiveEvent() {
        var selector = "input[type='submit'], [data-active]";
        var $elem, $activeElem;
        var timeHandler = 0;
        var LONG_TAP_TIME = 500;
        
        $(document).off(BDY.touchstart + ".body").on(BDY.touchstart + ".body", function(e) {
            
            $elem = $(e.target);
            $activeElem = $elem;

            if (!$activeElem.filter(selector).length) {
                $activeElem = $activeElem.parents(selector);                
            } 
            
            var activeStyle = $activeElem.attr("data-active") || "active";
            $activeElem.addClass(activeStyle);
            
            timeHandler = _setTimeout(function() {
               $elem && $elem.trigger('longTap');
               _removeActive();
            }, LONG_TAP_TIME);
        });
        
        $(document).off("touchmove.body, scroll.body").on("touchmove.body, scroll.body", function(event) {
            clearTimeout(timeHandler);
            timeHandler = 0;
            
            _removeActive();
            $elem = null;
        });
        
        $(document).off("mouseout.body").on("mouseout.body", selector, function(event) {
            _removeActive();
            $elem = null;
        });
        
        var lastTime = 0;
        $(document).off(BDY.touchend + ".body").on(BDY.touchend + ".body", function(e) {
           clearTimeout(timeHandler);
           timeHandler = 0;
            
           if ($elem) {
               var currentTime = (new Date()).getTime();
               var duration = currentTime - lastTime;
               var MIN_TRIGGER_INTERVAL = 300;
               
               if (duration > MIN_TRIGGER_INTERVAL) {
                   $elem.trigger('touchclick');
                   // 记录当前时间
                   lastTime = currentTime;
               }
           }
           
           _removeActive();
        });
        
        function _removeActive() {
            if ($activeElem != null) {
                var activeStyle = $activeElem.attr("data-active") || "active";          
                $activeElem.blur();
                $activeElem.removeClass(activeStyle);
                $activeElem = null;
            }
            $elem = null;
        }
        
        ['longTap', 'touchclick'].forEach(function(m) {
           $.fn[m] = function(callback) {
               return this.on(m, callback);
           };
        });
    }
    
    function _initUrl() {
        var env = getLocalData("env") || "production";
        switch (env) {
            case "test":
                exports.url = "";
                break;
            default:
                exports.url = "";
                break;
        }
        
    }
    
    function historyBack() {
        var curPage = $("#container").attr('data-page');
        pages[curPage] = pages[curPage] || {};
        pages[curPage]['scrollTop'] = 0;
        if (!OujSdk.historyBack()) {
            history.back();
        }
    }
    
    function _redirect(param, causeHistory) {
        if(param.match(getParam("page"))){
            return;
        }
        
    	oldPage = $("#container").attr('data-page');
        pages[oldPage] = pages[oldPage] || {};
        pages[oldPage]['scrollTop'] = _getScrollTop();
        var values = parseHash(param);
        isForward = true;
        // setParam(values, causeHistory);
        var search = document.location.search.substr(1);
        for(var key in values) {
            search = setParam2(key, values[key], search);
        }
        location.href = location.origin + location.pathname + "?" + search;
        //if (pages[values['page']]) {
        //    pages[values['page']]['scrollTop'] = 0;
        //}

        // 这里需要自己渲染
        // _redirectPage(values['page']);
    }

    function redirectClient(param, clientParam) {
        oldPage = $("#container").attr('data-page');

        var values = parseHash(param);
        if (window.Ouj) {
            var search = document.location.search;
            search = setParam2(values, search);
            if (clientParam) {
                values = parseHash(clientParam);
                search = setParam2(values, search);
            }

            OujSdk.openUrl(location.origin + location.pathname + search);
        } else {
            redirect(param);
        }
    }

    function redirect(param) {
    	_redirect(param, true);
    }
    
    function redirect2(param) {
    	var oldUrl = document.location.href;
    	_redirect(param, false);
    	if (oldUrl != document.location.href) {
    		var newPage = getParam('page') || 'user-center';
    		_redirectPage(newPage);
    	}
    }
    
    function _getScrollTop() {
        return document.documentElement.scrollTop || document.body && document.body.scrollTop;        
    }

    function openUrl(url, title, needTopBar) {
        if (!OujSdk.openUrl(url, title, needTopBar)) {
            window.open(url);
        }
    }
    
    function closeWebView() {
        if (!OujSdk.closeWebView()) {
            historyBack();
        }
    }
    
    function closeAllWebView() {
        if (!OujSdk.closeAllWebView()) {
            historyBack();
        }
    }

    function _redirectPage(_page) {
        pages[_page] = pages[_page] || {};
        if(!isInit) {
            if(isForward) {
                $(".o-trans-next").addClass('o-trans-fading');
                $("#container").addClass('o-rendering');
            } else {
                $(".o-trans-prev").addClass('prev-rendering');
                $(".o-container").addClass('o-trans-fading');
            }
        }

        if (!pages[_page]['dom']) {
            _getNewPage(_page);
        } else {
            _changePage(_page);
        }
    }
    
    function _getNewPage(_page, option) {
        var url = _page.replace('-', '/') + '.html';
        var path = document.location.href;
        var pos = path.indexOf("/index/");
        if (pos == -1) {
            pos = path.indexOf("/cacheIndex/");
        }
        var prefix = 'page';
        url = prefix + path.substr(0, pos) + "/" + url;
        get(url, function(responseText) {
            setTimeout(function(){
                $("#container").removeClass('o-initLoading');
            },50);

            var $page = $(responseText);
            var $fragment = $(document.createDocumentFragment());
            pages[_page]['dom'] = $fragment.append($page.filter("div"));
            pages[_page]['script'] = $page.filter("script");

            _changePage(_page, option);
        });
    }

    function _changePage(_page) {
        changeNav(_page);
        setTimeout(function () {
            var $pageswarp = $("#container");
            var $page = $pageswarp.children();
            if (oldPage && $page.length) {
                pages[oldPage] = pages[oldPage] || {};
                //保存滚动条位置$pageswarp
                // pages[oldPage]['scrollTop'] = document.body.scrollTop;
                //console.log("oldPage:" + oldPage + ", scrollTop:" + pages[oldPage]['scrollTop']);
                // pages[oldPage]['height'] = $pageswarp.height();
                pages[oldPage]['script'] = $page.filter("script");
                
                var $fragment = $(document.createDocumentFragment());
                pages[oldPage]['dom'] = $fragment.append($page.filter("div"));
                
                _clearRes();
            }

            _renderPage(_page);

            $(document).trigger(BDY.pageChange, _page);
            oldPage = _page;
        }, 400)
    }

    $(document).on(BDY.onResume, function() {
        var page = getParam('page');
        if (page) {
            var js = page.replace('-', '/js/') + '.js';
            console.log('onResume, ' + js);
            require.async(js, function(info) {
                info.init && info.init();
            });
        }
    });

    $(document).on(BDY.pageChange, function(event, _page) {
        // 读取页面的配置信息
        var pageInfo = $("#config").html();
        if (!pageInfo) {
            pageInfo = BDY.defalutPageInfo;
        } else {
            pageInfo = JSON.parse(pageInfo);
            pageInfo = $.extend({}, BDY.defalutPageInfo, pageInfo);
        }

        // 判断需不需要顶部
        if (pageInfo['noTopBar']) {
            // 隐藏顶部Bar
            $("#nav_bar").hide();
        } else {
            $("#nav_bar").show();

            _controlNavBtn(pageInfo);
            //设置后退按钮
            if (pageInfo["allowBack"] && window.history.length) {
                $("#nav_back").show();
            } else {
                $("#nav_back").hide();
            }

            //设置标题放在最后面减少标题被后退按钮挤压产生抖动
            pageInfo["title"] && setTitle(pageInfo["title"]);
        }
    });

    function _controlNavBtn(pageInfo) {
        // 判断是否有nav按钮
        var strBtnText = pageInfo['navBtn'];
        if (strBtnText) {
            $("#nav_btn1_toggle, #nav_btn1_collapse").text(strBtnText).css("display", null);
        } else {
            $("#nav_btn1_toggle, #nav_btn1_collapse").hide();
        }
    }

    function _renderPage(_page) {
        var $pageswarp = $("#container");
        //回调放在页面js的init方法之前执行，不然会覆盖init里面的setParam
        try {
            //还原dom元素
            var dom = pages[_page]['dom'];
            $pageswarp.html(dom);
            var script = pages[_page]['script'];
            try{
                script && $pageswarp.append(script);
            } catch(e) {
                console.error(e); 
            }

            // 设置页面标识
            $pageswarp.attr('data-page', _page);

            setTimeout(function() {
                if(!isInit) {
                    if(isForward) {
                        $(".o-trans-next").removeClass('o-trans-fading');
                        $(".o-container").removeClass('o-rendering');
                        scrollTo(0, 0);
                    } else {
                        $(".o-trans-prev").removeClass('prev-rendering');
                        setTimeout(function () {
                            //收起过渡效果并触发页面reflow
                            $(".o-container").removeClass('o-trans-fading').width(window.innerWidth);
                            $(".o-wrapout").get(0).clientLeft;

                            var scrollTop = pages[_page]['scrollTop'] || 0;
                            scrollTo(0, scrollTop);
                        }, 100)
                    }
                } else {
                    isInit = false;
                }

                isForward = false;
            }, 200);
        } catch(e) {
            console.error(e); 
        }
    }

    function changeNav(_page) {
        var $nav = $(".o-nav");
        $nav.find(".nav-con").removeClass("current");
        if(!(_page.match("home-process") || _page.match("home-bindUser") || _page.match("map-position") )){
            $nav.show();
        }

        if(_page.match("home-process") || _page.match("home-bindUser") || _page.match("map-position")) {
            $nav.remove();
        }

        if(_page == "home-index" || _page == "home-task") {
            $nav.find(".nav-home").addClass("current");
        } else if(_page.match("car")) {
            $nav.find(".nav-user").addClass("current");
        } else if(_page.match("order-list")) {
            $nav.find(".nav-now").addClass("current");
        }
    }
    
    function onNavBtnClick(callback) {
        $(document).on(BDY.navBtnClick + "_" + getParam("page"), callback);
    }
    
    var loadingDelayHandler = 0;
    var loadingTimeoutHandler = 0;
    
    function showLoading(text, timeout, cancelable, delay) {
    	// 超时时间为15s
        timeout = timeout || 15000;
        // 0.2s后才显示loading
        delay = delay || 200;
        
        if (cancelable == null) {
            cancelable = true;
        } else {
            cancelable = !!cancelable;
        }
        
        if (loadingDelayHandler) {
        	return;
        }
        
        loadingDelayHandler = setTimeout(function() {
        	if (!OujSdk.showLoading(text, timeout, cancelable)) {
        		loadDialog = dialog().showModal();
        		
        		loadingTimeoutHandler = setTimeout(function(){
        			hideLoading();
        			showTip("加载超时，请稍后再试");
        		}, timeout);
        		
        		$(".ui-popup-backdrop").on(BDY.click, function(){
        			loadDialog && loadDialog.close().remove();
        			loadDialog = null;
        		});
        	}
        }, delay);
    }
    
    function hideLoading() {
    	loadingDelayHandler && clearTimeout(loadingDelayHandler);
    	loadingDelayHandler = 0;
    	loadingTimeoutHandler && clearTimeout(loadingTimeoutHandler);
    	loadingTimeoutHandler = 0;
    	
        if (!OujSdk.hideLoading()) {
            loadDialog && loadDialog.close().remove();
            loadDialog = null;
        }
    }
    
    function showErrorTip(msg, timeout) {
        if (!msg) { return; }
        timeout = timeout || 3000;
        if (!OujSdk.showErrorTip(msg, timeout)) {
            var d = dialog({
                content : msg,
                skin : 'weui-dialog'
            }).showModal();

            //2秒后自动关闭
            setTimeout(function(){
                d.close().remove();
            },timeout);
        }
    }
    
    function showTip(msg, timeout) {
        if (!msg) { return; }
        timeout = timeout || 2000;
        if (!OujSdk.showTip(msg, timeout)) {
            var d = dialog({
                content : msg,
                skin : 'weui-dialog'
            }).width(window.innerWidth*0.75).showModal();

            //2秒后自动关闭
            setTimeout(function(){
                d.close().remove();
            },timeout);

            $(".ui-popup-backdrop").on(BDY.click, function(){
                try{
                    d.close().remove();
                }catch(e){}
            });
        }
    }

    function showDialog(msg, callback, title, buttonLabels) {
        title = title || "提示";
        buttonLabels = buttonLabels || "确定";
        var d = dialog({
            title: title,
            content: msg,
            skin: 'weui-dialog',
            okValue: buttonLabels,
            ok: function () {
                callback && callback(true);
                d.close().remove();
            }
        });
        d.width(window.innerWidth*0.75).showModal();
    }
    
    function _confirm(msg, callback, title, buttonLabels) {
        title = title || "提示";
        buttonLabels = buttonLabels || "确定,取消";
        if (!OujSdk.confirm(msg, callback, title, buttonLabels)) {
            var d = dialog({
                title: title,
                content: msg,
                skin: 'weui-dialog',
                okValue: buttonLabels.split(",")[0],
                ok: function () {
                    callback(true);
                    d.close().remove();
                },
                cancelValue: buttonLabels.split(",")[1],
                cancel: function () {
                    callback(false);
                    d.close().remove();
                }
            });
            d.width(window.innerWidth*0.75).showModal();
        }
    }

    function getValueByKey(value, key, obj) {
        for(var i in obj) {
            if(obj[i][key] == value) {
                return obj[i];
            }
        }
    }

    function checkWXAgent() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }
    
    // 设置标题
    function setTitle(title) {
        $('#nav_title').text(title);
        document.title = title;
    }

    return exports;
});

