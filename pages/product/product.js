//index.js  
//获取应用实例  
var app = getApp()
Page({
    data: {
        winWidth: 0,
        winHeight: 0,
        currentTab: 0,
        // 商品信息
        showNowData: false,
        shopping: [],
        // 分类信息
        tabData: [],
        scrollTop: 100,
        classidnow: 0,
        page: 1,
        lastLoadTime: 0,
        Loading: false,
        pullAllow: true,
        pullUpAllow: true
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
        const shopid = app.globalData.shopid
        const userid = app.globalData.userid
        wx.request({
            url: 'https://daodian.famishare.me/v1/product/get_product_class',
            method: 'POST',
            data: {
                shopid: shopid
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                let tabDataRe = res.data.data
                tabDataRe.push({ classid: 0, classname: "全部" })
                tabDataRe.reverse()
                console.log(tabDataRe)
                that.setData({
                    tabData: tabDataRe
                })
                wx.request({
                    url: 'https://daodian.famishare.me/v1/product/get_product_list',
                    method: 'POST',
                    data: {
                        shopid: shopid,
                        classid: tabDataRe[0].classid,
                        userid: getApp().globalData.userid,
                        page: 1
                    },
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success: function(res) {
                        console.log(res)
                        let shoppingDetail = res.data.data
                        if (res.data.data.length != 0) {
                            that.setData({
                                shopping: shoppingDetail,
                                showNowData: false
                            })
                            console.log(that.data.shopping)
                        } else {
                            that.setData({
                                shopping: shoppingDetail,
                                showNowData: true,
                                pullAllow: false
                            })
                        }
                    }
                })
            }
        })
    },
    /** 
     * 滑动切换tab 
     */
    bindChange: function(e) {
        var that = this;
        that.setData({ currentTab: e.detail.current });
    },
    swichNav: function(e) {
        var that = this;
        var shopid = getApp().globalData.shopid

        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
        that.setData({
            scrollTop: 0
        })
        var classid = e.currentTarget.dataset.class
        that.setData({
            classidnow: classid,
            page: 1
        })
        const userid = getApp().globalData.userid
        console.log(classid)
        wx.request({
            url: 'https://daodian.famishare.me/v1/product/get_product_list',
            method: 'POST',
            data: {
                shopid: shopid,
                classid: classid,
                userid: userid
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                let shoppingDetail = res.data.data
                if (res.data.data.length != 0) {
                    that.setData({
                        shopping: shoppingDetail,
                        showNowData: false,
                        pullAllow: true,
                        Loading: false
                    })
                    console.log(that.data.shopping)
                } else {
                    that.setData({
                        shopping: shoppingDetail,
                        showNowData: true,
                        pullAllow: false,
                        Loading: false
                    })
                }
            }
        })
    },
    gotoDetail: function(e) {
        console.log(e)
        const id = e.currentTarget.dataset.id
        const price = e.currentTarget.dataset.price
        if (price == 0) {
            wx.navigateTo({
                url: '/pages/detail/detailAticle?id=' + id
            })
        } else {
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + id
            })
        }
    },
    onShareAppMessage: function() {
        return {
            title: getApp().globalData.shopname,
            path: '/pages/product/product'
        }
    },
    upper: function() {
        var that = this
        var timestamp = Date.parse(new Date()) / 1000;
        var lastTime = this.data.lastLoadTime
        if (timestamp - lastTime < 5) {
            console.log('太快了')
        } else {
            that.setData({ lastLoadTime: timestamp })
            if (this.data.pullUpAllow) {
                console.log('刷新啦')
                that.setData({
                    pullUpAllow: false
                })
                wx.showNavigationBarLoading() //在标题栏中显示加载
                console.log(that.data.classidnow)
                wx.request({
                    url: 'https://daodian.famishare.me/v1/product/get_product_list',
                    method: 'POST',
                    data: {
                        shopid: getApp().globalData.shopid,
                        classid: that.data.classidnow,
                        userid: getApp().globalData.userid
                    },
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success: function(res) {
                        console.log(res)
                        if (res.data.data.length != 0) {
                            let shoppingDetail = res.data.data
                            that.setData({
                                shopping: shoppingDetail,
                                showNowData: false
                            })
                            console.log(that.data.shopping)
                        } else {
                            that.setData({
                                shopping: shoppingDetail,
                                showNowData: true
                            })
                        }
                    },
                    complete: function() {
                        wx.hideNavigationBarLoading() //完成停止加载
                        wx.stopPullDownRefresh() //停止下拉刷新
                        setInterval(() => {
                            that.setData({
                                pullUpAllow: true
                            })
                        }, 1000)
                    }
                })
            }
        }
    },
    lower: function(e) {
        // pullAllow为下拉刷新的开关，当在一定的情况下，禁止下拉刷新，防止其多次调用
        if (this.data.pullAllow) {
            var that = this
            var pagenow = this.data.page
            pagenow++
            var curTime = e.timeStamp;
            var lastTime = this.data.lastLoadTime;

            this.setData({
                Loading: true,
                pullAllow: false
            })

            console.log('触底执行')
            wx.request({
                url: 'https://daodian.famishare.me/v1/product/get_product_list',
                method: 'POST',
                data: {
                    userid: getApp().globalData.userid,
                    page: pagenow,
                    shopid: getApp().globalData.shopid,
                    classid: this.data.classidnow
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    console.log(res)
                    if (res.data.errcode == 0) {
                        // 判定获取数据中是否有内容，若没有，则禁止再次调用
                        if (res.data.data.length != 0) {
                            console.log('执行了')
                            var shopping = that.data.shopping
                            shopping = shopping.concat(res.data.data)
                            that.setData({
                                shopping: shopping,
                                page: pagenow,
                                lastLoadTime: curTime,
                                Loading: false,
                                pullAllow: true
                            })
                        } else {
                            console.log('判定禁止')
                            that.setData({
                                Loading: false,
                                pullAllow: false
                            })
                            console.log(that.data.Loading)
                        }

                    }
                }
            })
        } else {
            console.log('不让你动了啦！')
        }
    }
})