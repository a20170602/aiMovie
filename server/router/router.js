// 路由层
const routerControler = require(__basename + '/routerControler/routerControler.js')
module.exports = (app) => {

    // 验证白名单
    app.use(routerControler.validWhiteList)

    // 验证token
    app.use(routerControler.validfyToken)

    // 获取验证码
    app.post('/getCode',routerControler.getCodeControler)

    // 注册路由
    app.post('/register', routerControler.registerControler)

    // 登录路由
    app.post('/login',routerControler.loginControler)

    // 获取电影列表
    app.get('/getMovieList',routerControler.getMovieListControler)

    // 获取电影列表数目
    app.get('/getMovieCount',routerControler.getMovieCountControler)

    // 获取商家基础信息
    app.get('/getBusinss',routerControler.getBusinssControler)

    // 测试用,上传图片到服务器
    app.post('/uploadPic',routerControler.uploadPicControler)

    // 发布电影
    app.post('/publicMovie',routerControler.publicMovieControler)

    // 查看电影详情
    app.post('/lookMovie',routerControler.lookMovieControl)

    // 上下架
    app.post('/upOrDown',routerControler.upOrDownControl)

    // 删除电影
    app.post('/deleteMovie',routerControler.deleteMovieControl)

    // 上传头像
    app.post('/uploaduploadAvatar',routerControler.uploadAvatarControl);


}

