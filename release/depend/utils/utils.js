define([
    'jquery',
    'lib',
    'jweixin'
], function ($, lib, wx) {
    var exports = {};

    var getLocationReady = false;
    var previewImg = false;
    var conf = lib.conf;

    var M = {
        getWxSDK : function(callback) {
            if(!lib.checkWXAgent()) {
                return;
            }

            var postData = lib.postParam(conf.transCode.I01004, {
                "wechatNo": "ohmWUuP-gDIjqf7DB4O0hTlALOWU",
                "url" : "http://www.1lutong.net"
            });

            lib.post(conf.ajaxURL, postData, function(r) {
                var ret = r.responseBody;
                if(ret.errCode == "B01004000") {
                    /** 获取成功 */
                    callback && callback({
                        "appId": ret.appId,
                        "nonceStr": ret.nonceStr,
                        "signature": ret.signature,
                        "timeStamp": ret.timeStamp
                    });
                } else {
                    /** 获取失败 */
                    lib.showTip(ret.errMsg);
                }
            });
        },
        getWxLocation: function (callback) {
            if (getLocationReady) {
                M.getWxLocation2(callback);
            } else {
                M.getWxSDK(function(config) {
                    config.debug = true;
                    config.jsApiList = ['getLocation'];

                    wx.config(config);
                    wx.ready(function () {
                        getLocationReady = true;
                        M.getWxLocation2(callback);
                    });
                });
            }
        },
        getWxLocation2 : function(callback) {
            wx.getLocation({
                success: function (res) {
                    callback(res.latitude, res.longitude);
                },
                cancel: function () {
                    lib.hideLoading();
                },
                fail: function (res) {
                    if (res.errMsg) {
                        lib.showErrorTip(res.errMsg);
                        lib.hideLoading();
                    } else {
                        if (callback) {
                            callback(res.latitude, res.longitude);
                        } else {
                            lib.hideLoading();
                        }
                    }
                }
            });
        },
        wxPreviewImage : function(imgList, curIndex) {
            lib.showLoading();
            M.getWxSDK(function(config) {
                if (previewImg) {
                    lib.hideLoading();
                    wx.previewImage({
                        current: imgList[curIndex],
                        urls: imgList
                    });
                } else {
                    config.debug = false;
                    config.jsApiList = ['previewImage'];

                    wx.config(config);
                    wx.ready(function() {
                        lib.hideLoading();
                        previewImg = true;
                        wx.previewImage({
                            current: imgList[curIndex],
                            urls: imgList
                        });
                    });
                }
            });
        }

    };

    function getLocation(callback, hideLoading) {
        !hideLoading && lib.showLoading();
        if (lib.checkWXAgent()) {
            M.getWxLocation(callback);
        } else if (navigator.geolocation) {
            var options = {
                enableHighAccuracy: true,
                maximumAge: 1000
            };

            //浏览器支持geolocation
            navigator.geolocation.getCurrentPosition(function(position) {
                C.onLocationSucc(position, callback);
            }, C.onLocationError, options);
        } else {
            lib.showTip("浏览器不支持获取地址");
        }
    }

    function showGallery($imgs, index) {
        var _picList = [];
        if(lib.checkWXAgent()) {
            $imgs.each(function(index, el) {
                _picList.push($(el).attr('src'));
            });

            //调用微信图片预览接口
            M.wxPreviewImage(_picList, index);
        } else {
            $imgs.each(function(index, el) {
                _picList.push({
                    src : $(el).attr("src"),
                    w: parseInt($(el).width()) * 2,
                    h: parseInt($(el).height()) * 2
                })
            });

            //保存当前查看图库数据
            lib.setLocalData("viewPicList", _picList);
            //跳转到图库页
            lib.redirect("page=common-gallery&pic_index=" + index);
        }
    }

    var C = {
        onLocationSucc: function (position, callback) {
            //经度
            var longitude = position.coords.longitude;
            //纬度
            var latitude = position.coords.latitude;

            callback(latitude, longitude);
        },
        onLocationError: function (error) {
            lib.hideLoading();
            switch (error.code) {
                case 1:
                    lib.showTip("位置服务被拒绝");
                    break;
                case 2:
                    lib.showTip("暂时获取不到位置信息");
                    break;
                case 3:
                    lib.showTip("获取信息超时");
                    break;
                case 4:
                    lib.showTip("未知错误");
                    break;
            }
        }
    };

    // 取最开始的url
    exports.getLocation = getLocation;
    exports.getWxLocation = M.getWxLocation;
    exports.showGallery = showGallery;

    return exports;
});