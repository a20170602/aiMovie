// 配置文件


//服务器地址端口配置
const serverOptions = {
    //地址，域名
    host: 'http://192.168.0.103',
    //端口
    post: 10000,

    //请求体允许大小 30M
    bodySize: 30 * 1024 + 'kb'
}

exports.serverOptions = serverOptions;


// 数据库配置
exports.dbOptions = {
    database: 'aimovie',
    user: 'root',
    password: '20170602',
    host: 'localhost',
    // 数据库语言
    dialect: 'mysql',
    // 连接池
    pool: {
        max: 5,
        min: 0,
        // 连接超时，单位毫秒
        acquire: 30000,
        // 闲置时间，释放连接，单位毫秒
        idle: 10000
    },

    // 东八区，北京标准时间
    timezone:'+08:00'
}

// 默认头像配置
exports.userOptions = {
    avatar:serverOptions.host + ':'+serverOptions.post + '/static/default.png',

    // userId前缀
    before:'aiMovie'
}

// 加盐配置
exports.saltOptions ={
    // 密码加盐
    passwordSalt:'p_aimovie',

    // token加盐
    tokenSalt:'t_aimovie'
}

// 发邮件配置
exports.emailOptions = {
    // 发邮箱地址
    host:'smtp.163.com',

    // 端口
    // 25：在阿里云服务器被禁止，建议使用465端口
    port:465,

    // 465需要配置为true
    secure:true,

    // 发邮箱的地址
    user:'chenjinyu20170602@163.com',

    // 授权码
    pass:'UBGJTYOXLOQGIFWJ'
}

// 过期时间配置
exports.expiresOptions = {
    validCodeExpires:60,

    tokenExpires:'14d'
}

