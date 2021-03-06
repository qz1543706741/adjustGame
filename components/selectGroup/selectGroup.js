// components/selectGroup/selectGroup.js

const {
  debounce,
  canAdjust
} = require('../../utils/util')
let timer = null
const app = getApp()
Component({
  behaviors: ['wx://form-field'], //内置behaviors，使自定义组件有类似于表单控件的行为。
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String
    },
    value: {
      type: Array
    },
    form_item: {
      type: Array
    }
  },

  lifetimes: {
    attached() {
      if (wx.getStorageSync('variable_form_single'))
        wx.setStorageSync('variable_form_single', undefined)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animate__slideInDown: '',
    has_add_btn: true,
    add_btn_url: app.globalData.imageUrl + 'add-btn.png',
    save_btn_url: app.globalData.imageUrl + 'save.png',
    selectList: [{
      group_index: '',
      adjust_school_info: '',
      adjust_major_info: ''
    }]
  },
  /**
   * 组件的方法列表
   */
  methods: {

    //添加表单项
    addinput: function () {
      const formItem = this.data.form_item
      const group_index = formItem.length
      if (group_index < 4) {
        //创建一个新的item
        const temp = Object.assign({}, formItem[0], {
          group_index: group_index + 1,
          schoolName: '',
          majorOptions: [],
          showText: '',
          schoolCode: '',
        })
        //新的item添加进入form
        formItem.push(temp)
        this.setData({
          form_item: formItem,
          animate__slideInDown: 'animate__slideInDown'
        })
        setTimeout(() => {
          this.setData({
            animate__slideInDown: ''
          })
        }, 1750);
      } else {
        wx.showToast({
          title: '最多可添加四个调剂志愿',
          icon: 'none'
        })
      }
    },

    //保存表单项
    saveBtn: function () {
      const tempValue = this.data.form_item.map(item => {
        return {
          schoolCode: item.schoolCode,
          schoolName: item.schoolName,
          group_index: item.group_index,
          majorCode: item.majorCode,
          majorName: item.majorName,
        }
      })
      //校验表单信息是否为空
      if (!tempValue.every(item => {
          return Object.entries(item).every(items => {
            return items[1] !== ''
          }) === true
        })) {
        wx.showToast({
          title: '提交信息不能为空',
        })
      } else {
        wx.showModal({
          content: '您是否确认保存调剂志愿，保存后无法更改哦！',
          success: ({
            confirm
          }) => {
            if (confirm) {
              this.setData({
                value: tempValue,
                has_add_btn: false
              })
              wx.setStorageSync('userAdjustInfo', this.data.value)
              //展示调剂院校成绩填报页面
              this.triggerEvent('showAdustDetail', this.data.value)
            }
          }
        })
      }
    },

    //输入
    inputHandeler: function (e) {
      //防抖
      timer = debounce(this.inputDataOperate.bind(this, e), timer)
    },

    //对输入框信息进行处理
    inputDataOperate: function (e) {
      wx.showLoading({
        title: '获取学校数据中',
      })
      wx.hideKeyboard()
      const {
        value
      } = e.detail
      const {
        index
      } = e.currentTarget.dataset

      if (isNaN(value)) return
      else {
        this.getSchoolName(value, index)
      }
    },

    //根据院校代码查询院校名称
    getSchoolName: async function (value, index) {
      if (app.globalData.schoolInfo[value]) {
        const {
          school_name
        } = app.globalData.schoolInfo[value]
        const majorResult = await this.getMajorName(value)
        this.setData({
          [`form_item[${index}].showText`]: `(${value}) ${school_name}`,
          [`form_item[${index}].schoolCode`]: value,
          [`form_item[${index}].schoolName`]: school_name,
          [`form_item[${index}].majorOptions`]: majorResult
        })
        wx.hideLoading()
      }
    },

    //获取专业列表
    getMajorName: function (schoolCode) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.serverUrl}/getSchoolMajorInfo`,
          method: 'GET',
          data: {
            schoolCode,
          },
          success: (res) => {
            resolve(res.data instanceof Array ? res.data.map(item => {
              const {
                major_code,
                major_name,
              } = item
              return {
                major_code,
                major_name
              }
            }) : [])
          },
          fail: err => {
            reject(err)
          }
        })
      })
    },

    //隐藏按钮
    showAddBtn: function () {
      if (this.data.has_add_btn)
        this.setData({
          has_add_btn: !this.data.has_add_btn
        })
      else {
        setTimeout(() => {
          this.setData({
            has_add_btn: !this.data.has_add_btn
          })
        }, 500)
      }

    },

    //获取选择的item信息
    getSelectedItem: function (e) {
      const {
        index
      } = e.currentTarget.dataset
      const {
        detail
      } = e
      const tempValue = {
        schoolCode: this.data.form_item[index].schoolCode,
        schoolName: this.data.form_item[index].schoolName,
        group_index: this.data.form_item[index].group_index,
        majorCode: detail.key,
        majorName: detail.value
      }
      let variable_form_single = wx.getStorageSync('variable_form_single')
      if (!variable_form_single) variable_form_single = []
      variable_form_single[index] = tempValue
      wx.setStorageSync('variable_form_single', variable_form_single)
      this.setData({
        [`form_item[${index}].majorCode`]: detail.key,
        [`form_item[${index}].majorName`]: detail.value,
        value: wx.getStorageSync('variable_form_single')
      })
    },

  }
})