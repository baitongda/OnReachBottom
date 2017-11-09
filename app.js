//app.js
App({
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },
    getUserInfo: function(cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function() {
                    wx.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }

    },

    registerIt: function() {
        wx.login({
            success: function(res) {
                if (res.code) {
                    that.setData({
                        LoginCode: res.code
                    })
                    that.register()
                    console.log(1)
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
                        userid: res.data.data.userid
                    })
                    console.log('从注册接口中获取的id为' + res.data.data.userid)
                    wx.setStorageSync('userid', res.data.data.userid)
                    console.log('从注册接口中注入的id为' + that.data.userid)
                    getApp().globalData.userid = res.data.data.userid
                }
            }
        })

    },
    loginTest: function() {
        var that = this
        if (!getApp().globalData.userid) {
            wx.showModal({
                title: '提示',
                content: '您尚未登录',
                confirmText: '去注册',
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
                                            console.log(1)
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
            console.log(e)
        }
    },
    globalData: {
        userid: '',
        shopid: 2,
        userscore: 0,
        userphone: '',
        shopname: ''
    }
})
