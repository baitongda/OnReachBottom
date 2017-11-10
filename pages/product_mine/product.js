//index.js  
//获取应用实例  
var app = getApp()
Page({
    data: {
        /** 
         * 页面配置 
         */
        winWidth: 0,
        winHeight: 0,
        // tab切换  
        currentTab: 0,
        shop: [],
        showNowData: false,
        page: 1,
        lastLoadTime: 0,
        Loading: false,
        pullAllow: true,
        type: 0
    },
    onLoad: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
    },
    onShow: function() {
        this.requestTypeMes(0)
    },
    /** 
     * 滑动切换tab 
     */
    bindChange: function(e) {
        var that = this;
        that.setData({ currentTab: e.detail.current });
    },
    /** 
     * 点击tab切换 
     */
    swichNav: function(e) {
        var that = this;
        const userid = getApp().globalData.userid
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
        this.setData({
            scrollTop: 0
        })
        var type = e.currentTarget.dataset.current
        this.setData({
            type: type
        })
        console.log('type' + type)
        wx.request({
            url: 'https://daodian.famishare.me/v1/order/get_my_order',
            method: 'POST',
            data: {
                userid: userid,
                type: type,
                page: 1
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log('切换请求出来的')
                console.log(res)
                if (res.data.errcode == 0) {
                    if (res.data.data.length != 0) {
                        that.setData({
                            shop: res.data.data,
                            showNowData: false,
                            Loading: false,
                            pullAllow: true,
                            page: 0
                        })
                    } else {
                        console.log('切换中因为判定无数据所以禁止')
                        that.setData({
                            shop: res.data.data,
                            showNowData: true,
                            Loading: false,
                            pullAllow: false,
                            page: 0
                        })
                    }
                }
                console.log(that.data.pullAllow)
            }
        })
    },
    ToDetail: function(e) {
        console.log(e)
        var id = e.currentTarget.dataset.id
        var status = e.currentTarget.dataset.status
        wx.navigateTo({
            url: '/pages/product_mine/produceDetail?id=' + id + '&status=' + status
        })
    },
    lower: function(e) {
        // pullAllow为下拉刷新的开关，当在一定的情况下，禁止下拉刷新，防止其多次调用
        console.log('fuck you')
        if (this.data.pullAllow) {
            var that = this
            var pagenow = this.data.page
            pagenow++
            var curTime = e.timeStamp;
            var lastTime = this.data.lastLoadTime;
            console.log(pagenow)
            this.setData({
                Loading: true,
                pullAllow: false
            })
            wx.request({
                url: 'https://daodian.famishare.me/v1/order/get_my_order',
                method: 'POST',
                data: {
                    userid: getApp().globalData.userid,
                    type: this.data.type,
                    page: pagenow
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    if (res.data.errcode == 0) {
                        // 判定获取数据中是否有内容，若没有，则禁止再次调用
                        console.log('下拉刷新出来了')
                        console.log(res)
                        if (res.data.data.length != 0) {
                            console.log('执行了')
                            var shop = that.data.shop
                            shop = shop.concat(res.data.data)
                            that.setData({
                                shop: shop,
                                page: pagenow,
                                Loading: false,
                                pullAllow: true
                            })
                        } else {
                            console.log('禁止了')
                            that.setData({
                                Loading: false,
                                pullAllow: false
                            })
                        }
                    }
                }
            })

        }

    },
    upper: function() {
        this.requestTypeMes(this.data.type)
    },
    requestTypeMes: function(type) {
        var that = this
        const userid = getApp().globalData.userid
        wx.request({
            url: 'https://daodian.famishare.me/v1/order/get_my_order',
            method: 'POST',
            data: {
                userid: userid,
                type: type
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                if (res.data.errcode == 0) {
                    if (res.data.data.length == 0) {
                        that.setData({
                            shop: res.data.data,
                            showNowData: true
                        })
                    } else {
                        that.setData({
                            shop: res.data.data,
                            showNowData: false
                        })
                    }
                }
            }
        })
    }
})