var OujSdk = {
    fnId : 0,
    cbList : []
}

/**
 * 检查注入状态
 * @param  {String} name 方法名
 */
OujSdk.checkInject = function(name) {
    if (typeof window.Ouj != "undefined") {
        if(typeof Ouj[name] == "undefined") {
            console.log('没有' + name + '这个方法')
            return false;
        } else {
            return true;
        }
    } else {
        // console.log("js方法未注入！");
        return false;
    }
}

OujSdk.callfn = function() {
    var _fnId = this.fnId++;
    var name = arguments[0];
    var param = [];

    for(var i = 1; i < arguments.length; i++) {
        if(typeof arguments[i] == "function") {
            this.cbList[_fnId] = arguments[i];
            arguments[i] = 'OujSdk.cbList[' + _fnId + ']';
        }

        param.push(arguments[i]);
    }

    if(this.checkInject(name)) {
        console.log('Ouj[' + name + '](' + param.join(',') + ')');
        Ouj[name].apply(Ouj, param);
        return true;
    } else {
        return false;
    }
}

OujSdk.openLogin = function() {
    return this.callfn("openLogin");
}

OujSdk.getUserInfo = function(callback) {
    return this.callfn("getUserInfo", callback);
}

OujSdk.getDeviceInfo = function(callback) {
    return this.callfn("getDeviceInfo", callback);
}

OujSdk.openUrl = function(url, title, needTopBar) {
    title = title || '';
    needTopBar = needTopBar === false ? needTopBar : true;
    return this.callfn("openUrl", url, title, needTopBar);
}

OujSdk.copy = function(txt) {
    return this.callfn("copy", txt);
}

OujSdk.historyBack = function() {
    return this.callfn("historyBack");
}

OujSdk.closeWebview = function() {
    return this.callfn("closeWebview");
}

OujSdk.setTitle = function(title) {
    return this.callfn("setTitle", title);
}

OujSdk.showLoading = function(txt) {
    txt = txt || '正在加载中...';
    return this.callfn("showLoading", txt);
}

OujSdk.hideLoading = function() {
    return this.callfn("hideLoading");
}

OujSdk.showTip = function(txt, timeout) {
    return this.callfn("showTip", txt, timeout);
}

OujSdk.showErrorTip = function(txt, timeout) {
    if (window.Ouj && Ouj.showErrortip) {
        OujSdk.showErrortip(txt, timeout);
    } else {
        return this.callfn("showTip", txt, timeout);
    }
}

OujSdk.showDialog = function(txt) {
    return this.callfn("showDialog", txt);
}

OujSdk.confirm = function(txt, callback, title, buttonLables) {
    title = title || '提醒';
    buttonLables = buttonLables || '确定,取消';
    return this.callfn("confirm", title, txt, callback, buttonLables);
}

OujSdk.getNetworkType = function(callback) {
    return this.callfn("getNetworkType", callback);
}

OujSdk.aliPay = function(platformData, callback) {
    return this.callfn("aliPay", platformData, callback);
}

OujSdk.wxPay = function(platformData, callback) {
    if (typeof platformData == 'object') {
        platformData = JSON.stringify(platformData);
    }
    return this.callfn("wxPay", platformData, callback);
}
