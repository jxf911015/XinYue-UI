import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register']

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(() => {
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }

  let loginForm = {
    username: "sense",
    password: "Uiap@1234",
    rememberMe: false,
    uuid: ""
  }
  store.dispatch("Login", {...loginForm, password: clientEncrypt(loginForm.password)}).then(response => {
    console.log('NogetToken Login', response)
    // 判断登录用户是否存在绑定门户
    if (response.code == 200) {
      if (response.data && response.data.subportalTempleteId) {
        Cookies.set("subportal_templeteId", response.data.subportalTempleteId);
      }
    }
    next({path: '/home/index'})
    NProgress.done()
  }).catch(() => {
    NProgress.done()
  });
})

router.afterEach(() => {
  NProgress.done()
})
