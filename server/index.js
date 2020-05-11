// 后台服务器入口文件

// 导入路径拼接模块
global.__basename = __dirname;

// 导入配置
global.config = require(__basename + '/config/config.js');

// 数据库连接,并且放入全局变量(这个需要放在router之前)
global.sequelize = require(__basename + '/db/sequelize.js');

// 导入express
const express = require('express');

//导入body-parser解析post请求体
const bodyParser = require('body-parser');

// 创建实例
const app = new express;

const router = require(__basename + '/router/router.js');

// 导入工具库
const tool = require(__basename + '/tool/tool.js')


// 数据库连接测试
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// 写入数据
const movie = require(__basename + '/data/admin1/movie.json');
const covers = require(__basename + '/data/admin1/covers.json');
const directors = require(__basename + '/data/admin1/directors.json');
const actors = require(__basename + '/data/admin1/actors.json')
// 加载电影数据
// tool.loadMovie(movie);
// tool.loadOther('Covers','cover_id',covers);
// tool.loadOther('Directors','director_id',directors);
// tool.loadOther('Actors','actor_id',actors);
// tool.gengeationAdmin({
//     adminName:'admin1',
//     password:'520134',
//     email:'1835471491@qq.com',
//     nickname:'小天'
// })


// 设置一个静态目录，用于存放文件
app.use('/static',express.static(__basename + '/upload'));

//解析post请求体
//将post请求参数解析为json
//limit限制解析post请求体大小
app.use(bodyParser.json({ limit: config.serverOptions.bodySize }));

//extended：false接收任何数据格式, true接收字符串或者数组
app.use(bodyParser.urlencoded({
    extended: false,
    limit: config.serverOptions.bodySize
}));

//CORS 跨域资源共享
//app.all(*)表示所有请求路径必须经过
app.all('*', (req, res, next) => {
    //允许跨域地址
    res.header("Access-Control-Allow-Origin", "http://192.168.0.103:8080");

    //*表示允许所有域请求，在实际开发中，一般指定允许某个域请求，如上面设置
    //res.header("Access-Control-Allow-Origin", "*");
    // 上面这种是不能带cookie过来的

    //如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。
    // 它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。
    // 注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    //该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，
    // 即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可
    res.header('Access-Control-Allow-Credentials', true);

    next();
});

// 这个路由层需要抽出来
// 加载路由
router(app);

// 处理404
app.use((req, res) => {
    res.status = 404;
    res.send({ msg: "找不到资源", code: 404 })
})

// 处理500
app.use((err, req, res) => {
    if (err) {
        res.status = 500;
        res.send({ msg: "服务器程序出错", code: 500 })
    }
})

// 监听端口
app.listen(config.serverOptions.post, () => {
    console.log(`${config.serverOptions.host}`)
})