# tabbar+下拉刷新

在最近的微信小程序开发中，遇到一个比较坑的界面开发，说坑并不是因为它难，而是这其中包括了太多的开发时所要填的坑了，今天准备将这些填完的小坑一个个刨出来仔细啃啃，做一个demo分享一下。
    
## 需求分析

简单梳理一下需求：1.tabbar 需要用 fixed来跟随 2.需要有上拉刷新，下拉加载的功能

需求很简单，看起来一个个都不是很困难，但其中隐约的藏着许多个小坑洼，需要一个个仔细的来填上。首先第一个需求，position:fixed; 直接实现，不存在任何困难。

## 实现方法

紧接着面对上拉刷新、下拉加载这个功能，老生常谈，主要有两个实现的方式：
1.scroll-view的上下监听函数，在触顶和触底时分别执行上拉刷新和下拉刷新机制。
2.微信api自带的onReachBottom 和 onPullDownFresh 两个函数，分别为触底执行和下拉刷新。

先来介绍一下两种方法：
1.利用scroll-view 来放置列表展示页，将产品列表贴在scroll-view上，利用下滑属性可以将产品展示在其中。在scroll-view触底时， 绑定bindtaplower 这个函数将会被触发，达到“下拉刷新”的效果。
2.利用page标签自带的onReachBottom 来达到下拉加载，上拉刷新。两个api属于自带的api，而这个的上拉刷新也自带了一个刷新动画。

两种方法均有其特点和优异之处。从个人的开发喜好来说，在单列表中，第二种方式，即OnReachBottom 和 onPullDownFresh 的方式是优于第一种方式的。为什么呢？因为它自带了一个下拉刷新的动画。而用scroll-view 的上拉刷新是不带这个动画的。所以谁更加优秀不言而喻啦。

那么，我们应该如何合适的使用这两种方案？

微信小程序是一种很简单的前端程序，但是它其中蕴含了许多的大大小小的坑。比如：在scroll-view 的碰边函数上，会出现碰触执行多次的问题，即触底执行的判定过于多次，导致其疯狂触发函数。

面临这样的bug，我的第一想法是给他们上个锁。每当函数执行时将锁关上，在函数之行结束之时再将锁打开。这样就可以将函数重复执行的问题解决了。

·上拉加载的函数·

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
                    url: '…',//这里放置的是接口的地址
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
    }


虽然可以解决下拉刷新触发过多的问题，但因为上拉刷新的硬伤，所以我认为，在能使用onReachBottom的情况下，不要去使用scroll-view来写。因为上拉加载时，用
Scroll-viewl动画提示用户在下拉刷新时，用的是showNavigationBarLoading()这个api，他做到的是在标题上加入一个旋转的小动画。但是使用这个api时，会产生的一个问题就是，如果在上拉加载时不放手时，还是会疯狂触发上拉刷新的bug，这是后标题会疯狂鬼畜的抖动。这时候，我想到的解决方案是给上拉再次加入一个时间锁。在三秒之内，再次触发刷新时，禁止它的触发。而自带的onReachBottom 将不会再触发这类问题，因为它要真真实实的上拉，所以综上所述，如果能用onReachBottom ，辣就不要用scroll-view来写上拉刷新啦，因为真的没那么好用的。

如果你以为这就结束了？
![image](./image/01.jpg)
	 
上一段说了，如果如果能用onReachBottom ，就用这个，那么什么情况下不能用呢？这就关系到一开始说的需求了，需求上是关系到一个需要position:fixed的属性的。那么，我们就要面临一个问题了。如果用的是view 标签，在拉到1/2 时，做tab切换，时候就面临一个问题：它的切换并不会切到顶部，而出现的也是在刷新之后的1/2处，这个体验非常不人性化。那么，在面对需要置顶的情况下，view的使用就会面临一个瓶颈了。如何让view置顶？这是个问题。

我的解决方案是：scroll-view 在每次切换时，让scrollTop行内标签归零，这样就可以让每次切换置顶了。而因为scrolltop一开始就为0，第一次的上拉刷新是不会触发的。在这样的场景下，目前还是用scroll-view 来的更为简便。

## 最终样式
![image](./image/item.gif)

这是最近开发的一个tabbar + 下拉刷新的demo，如果有需要，就到github里来取吧，如果可以的话记得给个小星星哟~
