var SITE_URL = "/";
var BDY = window.BDY || {};

BDY.cdnUrl = "./depend";
BDY.version = 11;
if ('createTouch' in document) {
    BDY.click = 'touchclick';
    BDY.touchstart = "touchstart";
    BDY.touchmove = "touchmove";
    BDY.touchend = "touchend";
    BDY.longTap = 'longTap';
} else {
    BDY.click = 'click';
    BDY.touchstart = "mousedown";
    BDY.touchmove = "mousemove";
    BDY.touchend = "mouseup";
    BDY.longTap = 'hover';
}

BDY.onResume = "onResume";
BDY.pageChange = "pageChange";
BDY.navBtnClick = "navBtnClick";

// 默认的页面配置
BDY.defalutPageInfo = {
    "title" : "",
    "allowGuest" : false,
    "allowBack" : true,
    "noTopBar" : false,
    "navBtn" : null
};

BDY.params = [];
BDY.timeout = [];
BDY.interval = [];
BDY.xhrs = [];
BDY.xhrCount = 0;

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: "$"
        },
        artDialog: {
            deps: ["jquery", "popup", "dialog-config"]
        }
    },
    paths: {
        "jquery": BDY.cdnUrl + '/jquery/jquery-2.1.4',
        "underscore": BDY.cdnUrl + '/underscore/underscore',
        "artDialog": BDY.cdnUrl + '/artDialog/dialog',
        "popup": BDY.cdnUrl + '/artDialog/popup',
        "dialog-config": BDY.cdnUrl + '/artDialog/dialog-config',
        "form": BDY.cdnUrl + '/form/form',
        "md5": BDY.cdnUrl + '/md5/md5',
        "store": BDY.cdnUrl + '/store/store',
        "template": BDY.cdnUrl + '/artTemplate/template',
        "cookie": BDY.cdnUrl + '/cookie/cookie',
        "ext-sdk": BDY.cdnUrl + '/ext-sdk/ext-sdk',
        "jweixin": BDY.cdnUrl + '/jweixin/jweixin-1.0.0',
        "react" : BDY.cdnUrl + '/react/react',
        "react-dom" : BDY.cdnUrl + '/react/react-dom',
        "lib": BDY.cdnUrl + '/library/library',
        "utils": BDY.cdnUrl + '/utils/utils'
    }
});



require(['lib', 'ext-sdk']);