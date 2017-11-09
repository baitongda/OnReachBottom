//index.js  
//获取应用实例  
var app = getApp()
Page({
    data: {
        winWidth: 0,
        winHeight: 0,
        currentTab: 0,
        // 商品信息
        shopping: [],
        // 分类信息
        tabData: []
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
                let tabDataRe = res.data.data.reverse()
                that.setData({
                    tabData: tabDataRe
                })
            }
        })
        wx.request({
            url: 'https://daodian.famishare.me/v1/product/get_product_list',
            method: 'POST',
            data: {
                shopid: shopid
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                let shoppingDetail = res.data.data.reverse()
                that.setData({
                    shopping: shoppingDetail
                })
                console.log(that.data.shopping)
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
    /** 
     * 点击tab切换 
     */
    swichNav: function(e) {

        var that = this;

        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
    },
    gotoDetail: function(e) {
        console.log(e)
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + id
        })
    },
})