// app.js
App({
  onLaunch: function () {
    // wx.getSystemInfo({
    //   success(res){
    //     console.log(res);
    //   }
    // })
    if (wx.getStorageSync('schoolInfo')) {
      this.globalData.schoolInfo = wx.getStorageSync('schoolInfo')
    } else {
      wx.request({
        url: `${this.globalData.jsonUrl}school.json`,
        success: (res) => {
          this.globalData.schoolInfo = res.data
          wx.setStorageSync('schoolInfo', res.data)
        }
      })
    }

  },

  //监听全局变量的变化
  watch: function (callback) {
    return new Proxy(this.globalData, {
      get: function () {
        return Reflect.get(...arguments)
      },
      set: function () {
        Reflect.set(...arguments)
        if (callback) callback([...arguments][0])
        return true
      },
    })
  },

  globalData: {
    userInfo: null,
    userGameInfo: {},
    userBasicInfo: {},
    serverUrl: 'http://10.221.197.151:3000',
    //serverUrl: 'http://localhost:3000',
    imageUrl: 'https://image-1304509895.file.myqcloud.com/',
    jsonUrl: 'https://myjson-1304509895.cos.ap-nanjing.myqcloud.com/',
    logUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code'
  },

});