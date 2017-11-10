//logs.js
Page({
    data: {
        ischoose: true,
        states: [{
            state: '待付款',
            color: '#f1312f',
            codeNum: 0
        }, {
            state: '待使用',
            color: '#f1312f',
            codeNum: 1
        }, {
            state: '已完成',
            color: '#8c8c8c',
            codeNum: 1
        }],
        state: [],
        markDisabled: false,
        buyBtn: false,
        phoneNumConfirm: 0,
    },
    onLoad: function(e) {
        console.log(e)
        var id = e.id;
        var price = this.data.price
        var status = e.status
        var state = []
        state.push(this.data.states[status])
        this.setData({
            state: state,
            type: status
        })
        const userid = getApp().globalData.userid
        var that = this
        wx.request({
            url: 'https://daodian.famishare.me/v1/order/get_order_info',
            method: 'POST',
            data: {
                userid: userid,
                orderid: id
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                if (res.data.errcode == 0) {
                    that.setData({
                        thumb: res.data.data.thumb,
                        productname: res.data.data.productname,
                        price: res.data.data.price,
                        amount: res.data.data.amount,
                        mobile: getApp().globalData.phoneNumber,
                        shop_address: res.data.data.shop_address,
                        payment: res.data.data.payment,
                        add_time_format: res.data.data.add_time_format,
                        code: res.data.data.code,
                        productid: res.data.data.productid
                    })
                }
            }
        })
    },
    finishedIt: function() {
        wx.navigateTo({
            url: '/pages/paidSuccess/paidSuccess?id=1'
        })
    },
    boughtIt: function(e) {
        var that = this
        if (!getApp().globalData.userid) {
            wx.showModal({
                title: '提示',
                content: '您尚未登录',
                confirmText: '去登录',
                confirmColor: '#ef312e',
                success: function(res) {
                    if (res.confirm) {
                        wx.openSetting({
                            success: (res) => {
                                wx.login({
                                    success: function(res) {
                                        if (res.code) {
                                            that.setData({
                                                LoginCode: res.code
                                            })
                                            that.register()
                                        } else {
                                            console.log(res.errMsg)
                                        }
                                    }
                                })
                                wx.getUserInfo({
                                    success: function(res) {
                                        that.setData({
                                            iv: res.iv,
                                            encryptedData: res.encryptedData,
                                            gender: res.userInfo.gender,
                                            username: res.userInfo.nickName,
                                            city: res.userInfo.city,
                                            avatar: res.userInfo.avatarUrl,
                                        })
                                        that.register()
                                        console.log(2)
                                    }
                                })
                                wx.getSystemInfo({
                                    success: function(res) {
                                        that.setData({
                                            platform: res.platform,
                                            device: res.model,
                                            system: res.system
                                        })
                                        that.register()
                                        console.log(3)
                                    }
                                })
                            }
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        } else if (!getApp().globalData.userphone) {
            wx.showModal({
                title: '提示',
                content: '为便于继续使用，请完善您的个人信息',
                confirmText: '去完善',
                confirmColor: '#ef312e',
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/receive/consummate'
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        } else {
            wx.request({
                url: 'https://daodian.famishare.me/v1/order/create_order',
                method: 'POST',
                data: {
                    productid: that.data.productid,
                    userid: getApp().globalData.userid,
                    amount: that.data.amount
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: function(res) {
                    console.log(res)
                    if (res.data.errcode == 0) {
                        wx.requestPayment({
                            'timeStamp': res.data.data.timeStamp,
                            'nonceStr': res.data.data.nonceStr,
                            'package': res.data.data.package,
                            'signType': 'MD5',
                            'paySign': res.data.data.paySign,
                            'success': function(res) {
                                wx.navigateTo({
                                    url: '/pages/paidSuccess/paidSuccess?id=0'
                                })
                            },
                        })
                    } else {
                        console.log('接口调用失败')
                        wx.showModal({
                            title: '提示',
                            content: res.data.errMsg,
                            confirmText: '知道了',
                            confirmColor: '#ef312e',
                            showCancel: false
                        })
                    }
                }
            })
        }

        console.log(e)
    },
    register: function() {
        var that = this
        const shopid = app.globalData.shopid
        wx.request({
            url: 'https://daodian.famishare.me/v1/user/register',
            method: 'POST',
            data: {
                code: that.data.LoginCode,
                iv: that.data.iv,
                encryptedData: that.data.encryptedData,
                gender: that.data.gender,
                username: that.data.username,
                city: that.data.city,
                avatar: that.data.avatar,
                platform: that.data.platform,
                device: that.data.device,
                system: that.data.system,
                shopid: shopid
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function(res) {
                console.log(res)
                if (res.data.errcode == 0) {
                    console.log('注册信息获取成功')
                    that.setData({
                        userid: res.data.data.userid,
                        userphone: res.data.data.mobile
                    })
                    console.log('从注册接口中获取的id为' + res.data.data.userid)
                    wx.setStorageSync('userid', res.data.data.userid)
                    console.log('从注册接口中注入的id为' + that.data.userid)
                    getApp().globalData.userid = res.data.data.userid
                    console.log('从注册接口中获取的手机号为' + res.data.data.mobile)
                    wx.setStorageSync('userphone', res.data.data.mobile)
                    console.log('从注册接口中注入的id为' + that.data.mobile)
                    getApp().globalData.userphone = res.data.data.mobile
                    let userid = res.data.data.userid
                    wx.request({
                        url: 'https://daodian.famishare.me/v1/product/get_product_detail',
                        method: 'POST',
                        data: {
                            productid: that.data.productid,
                            from_userid: that.data.fromuserid,
                            userid: userid
                        },
                        header: {
                            'content-type': 'application/json' // 默认值
                        },
                        success: function(res) {
                            console.log(res)
                            var content = WxParse.wxParse('content', 'html', res.data.data.content, that, 5);
                            if (res.data.errcode == 0) {
                                that.setData({
                                    productname: res.data.data.productname,
                                    Price: res.data.data.price,
                                    share_price: res.data.data.share_price,
                                    content: content,
                                    share_count: res.data.data.have_shared,
                                    share_num: res.data.data.share_num,
                                    productid: res.data.data.productid,
                                    brief: res.data.data.brief
                                })
                            } else {
                                console.log('errcode!=0')
                            }
                        }
                    })
                }
            }
        })

    },
    goBack: function() {
        wx.navigateBack({
            delta: 1
        })
    },
    Dacall: function() {
        wx.makePhoneCall({
            phoneNumber: getApp().globalData.phoneNumber, //此号码并非真实电话号码，仅用于测试
            success: function() {
                console.log("为到店疯狂打call")
            },
            fail: function() {
                console.log("拨打电话失败！")
            }
        })
    },
    openMap: function() {
        wx.openLocation({
            latitude: getApp().globalData.lat,
            longitude: getApp().globalData.lng,
            name: getApp().globalData.shopname,
            address: getApp().globalData.address
        })
    },
    keptIt: function() {
        var that = this
        if (this.data.markDisabled) {
            that.setData({
                buyBtn: true,
                phoneNumConfirm: that.data.userphone,
                markDisabled: false
            })
            console.log(getApp().globalData.data)
            getApp().bindMobile({
                username: getApp().globalData.data.username,
                userid: getApp().globalData.data.userid,
                mobile: that.data.phoneNumConfirm
            }, (res) => {
                console.log(res)
            })
        }
    },
    userPhoneInput: function(e) {
        this.setData({
            userphone: e.detail.value
        })
        if (this.data.userphone.trim().length == 11) {
            this.setData({
                markDisabled: true
            })
        } else {
            this.setData({
                markDisabled: false
            })
        }
    },
})