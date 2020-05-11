const sequelize = require('sequelize')

const Op = sequelize.Op;

// 导入白名单
const whiteList = require(__basename + '/list/whiteList.js')
const tokenList = require(__basename + '/list/tokenList.js')


// 导入API服务层
const api = require(__basename + '/api/api.js');

// 导入工具库
const tool = require(__basename + '/tool/tool.js');


// 再抽一层，路由控制器层
class RouterControler {
    constructor() { }

    // 验证白名单
    validWhiteList(req, res, next) {
        if (whiteList.includes(req.headers.origin)) {
            // 白名单验证通过
            next();
        } else {
            res.send({ msg: '请求路径不合法', code: 0 })
        }
    }

    // 验证token
    validfyToken(req,res,next){
        // 检验请求路劲是否在token验证列表内

        if(!tokenList.includes(tool.getOriginRouter(req.url))){
            // 如果列表没有直接不需要验证
            return next();
        }


        // 当没有cookie时候拦截

        if(!req.headers.cookie){
            res.send({msg:'登录状态已过期,请重新登录',code:1201});
            return;
        }


        const cookie = tool.formatCookie(req.headers.cookie);
        const token = cookie['ai_movie'];


        if(!token){
            res.send({msg:'登录状态已过期,请重新登录',code:1201});
        }else{
            // 这里还需要验证token是否合法
            tool.validfyToken({
                token,
                salt:config.saltOptions.tokenSalt,
                fn:(err,decoded)=>{
                    if(err){
                        res.send({msg:'token验证失败,请重新登录',code:1202});
                    }else{
                        // 把token换成一个userId , 让后面使用
                        req.body.userId = decoded.data;
                        next();
                    }
                }
            })

        }
    }

    // 发送验证码
    getCodeControler(req,res){
        // console.log(req.body)
        // 这里去发送邮箱
        // 先获取一个验证码
        const code = tool.generateValidCode();
        // to的邮箱
        const email = req.body.email;
        console.log('email==>',email)
        console.log('code==>',code)


        // 先存储验证码进入表里面再发邮件
        api.createData('Code',{
            email,
            code
        }).then(result =>{
            // 存储验证码成功，然后进行发送验证码
            // return res.send({msg:"测试不发邮件",code})

            // 发验证码邮件
            tool.sendEmail({
                from:config.emailOptions.user,

                to:email,

                subject:"爱电影-验证码",

                text:`验证码：${code} 1分钟后失效`
            },(err,data)=>{
                if(err){
                    console.log('err==>',err)
                    res.send({msg:"邮件发送失败" , code:1011})
                }else{
                    res.send({msg:'邮件发送成功', code:1010})
                }
            })
           
        }).catch(err =>{
             // 存储验证码失败
             res.send({msg:"获取验证码失败",code:1012})
        })
  
    }

    // 注册
    registerControler(req, res) {

        // 需要先验证是否是这个验证码
        // 1.0需要把过了创建时间过了一分钟的验证码去掉
        let currentTime = +new Date();
        const cutTime = new Date(currentTime - 1000* config.expiresOptions.validCodeExpires ).toLocaleString();


        // 先删除
        api.destroyData('Code',{
            // 一分钟之前的全部删除
            createdAt:{
                [Op.lte]: cutTime
            }
        })
        .then(() =>{
             // 获取当前email的验证码是否存在
            api.findData('Code',{
                 email:req.body.email
             })
            .then(result=>{
                if(result.length == 0){
                    res.send({msg:'验证码已失效',code:1021})
                }else if(result[0].code == req.body.validCode){
                    // 这里执行验证邮箱操作
                        // return res.send({msg:"测试中",code:1000000});

                        // 验证当前邮箱是否已经被注册
                        api.findData('Business',{
                            email:req.body.email
                        }).then(result =>{
                            if(result.length == 0){
                                // 该邮箱未被注册
                                // 密码加密
                                const password = tool.encodeString(req.body.password,config.saltOptions.passwordSalt);
                                const userId = config.userOptions.before + +new Date();
                                api.createData('Business', {
                                    userId,
                                    password,
                                    email: req.body.email,
                                    nickname: req.body.nickname
                                }).then(result => {
                                    res.send({ msg: "注册成功", code: 1000 })

                                }).catch(err => {
                                    res.send({ msg: "注册失败", code: 1001 })
                                })

                            }else{
                                res.send({msg:"该邮箱已被注册",code:1002}) 
                            }

                        }).catch(err =>{
                            res.send({msg:"查询邮箱失败",code:1003})
                        })

                }else{
                    res.send({msg:'验证码输入有误',code:1023})
                }

             })
            .catch(err =>{
                res.send({msg:'查询验证码失败',code:1022})
             })
        })
        .catch(err =>{
            res.send({msg:'删除验证码失败',code:1023})
        })

    }

    // 登录
    loginControler(req,res){

        // 根据拿过来的email判断是否用户注册
        const email = req.body.email;
        // 获取加密后密码
        const password = tool.encodeString(req.body.password,config.saltOptions.passwordSalt);

        
        api.findData('Business',{email})
        .then(result =>{
            if(result.length == 0){
                res.send({msg:"账户不存在",code:1102})
            }
        })
        .then(()=>{
            console.log('验证密码');
            // 验证密码
            return api.findData('Business',{email,password})
        })
        .then(result=>{
            console.log('result==>',result[0].dataValues.userId)
            if(result.length == 0){
                res.send({msg:'邮箱或密码错误',code:1101})
            }else{
                // 在登录成功的时候存储
                tool.generateToken({
                    data:result[0].dataValues.userId,
                    salt:config.saltOptions.tokenSalt,
                    expiresIn:config.expiresOptions.tokenExpires,
                    fn:(err,token)=>{
                        res.send({msg:'登录成功',code:1100,token})
                    }
                })        
            }

        })
        .catch(err =>{
            res.send({msg:"登录失败",code:1103})
        })
    }


    // 获取商家信息
    getBusinssControler(req,res){
        api.findData('Business',{
            userId:req.body.userId
            // 需要查到nickname 和 avatar
        },['nickname','avatar'])
        .then(result =>{
            res.send({msg:"查询商家信息成功",code:1300,result})
        })
        .catch(err =>{
            res.send({msg:"查询商家信息失败",code:1301})
        })
    }

    // 获取电影列表
    getMovieListControler(req,res){
        let userId = req.body.userId;
        let begin = +req.query.begin || 0;
                // 上映日期
        let date = req.query.date || '%'

        // 电影名称
        let name = req.query.name ? '%'+ req.query.name + '%' : '%'

        // let order = req.query.order  || 'date'

        // console.log("order==>",order)

        // 状态
        let status = req.query.status || '%'
        let sql = "SELECT `m`.`movie_id` AS movieId, `m`.`name`,`m`.`status`, `m`.`date`, `m`.`created_at`, `m`.`updated_at` FROM `movie` AS `m` WHERE `m`.user_id = :userId AND `m`.`name` LIKE :name AND `m`.`status` LIKE :status AND `m`.`date` LIKE :date ORDER BY date LIMIT :begin,10;"
        
        api.query(sql,{userId,name,status,date,begin}).then((result)=>{
            res.send({msg:'获取电影信息成功',result,code:3000})
        })
        .catch(err =>{
            res.send({msg:'获取电影信息失败',result,code:3001})
        })  
    }

    // 获取电影列表数目
    getMovieCountControler(req,res){
        let userId = req.body.userId;
        console.log('userId==>',userId)

        // 上映日期
        let date = req.query.date || '%'

        // 电影名称
        let name = req.query.name ? '%'+ req.query.name + '%' : '%'

        // 状态
        let status = req.query.status || '%'

        let sql = "SELECT COUNT(*) AS count FROM `movie` AS `m` WHERE `m`.user_id = :userId AND `m`.`name` LIKE :name AND `m`.`status` LIKE :status AND `m`.`date` LIKE :date;";

        api.query(sql,{userId,name,status,date}).then((result)=>{
            res.send({msg:'获取电影列表数目成功',result,code:3100})
        })
        .catch(err =>{
            res.send({msg:'获取电影列表数目失败',code:3101})
        })
    
    }

    // 测试上传图片
    uploadPicControler(req,res){
        // 需要写入服务器
        tool.upLoadImg(req.body)
        .then(result =>{
            console.log('result==>',result);
            // res.send({msg:"上传图片",result})
        })
        .catch(err =>{
            console.log(err)
        })


        res.send({msg:"上传图片"})
    }

    // 发布电影
    publicMovieControler(req,res){
        // 观看数据
        /*
        根据req.body ==> isEdit 是否编辑  ==>不是编辑的话

        不需要生成movieId

        */

        // 如果有id就拿
        let movieId = req.body.movieId || tool.createdId('ai_movie');
 
        console.log('movieId==>',movieId)

        // 电影数据
        const movie = {}

        movie.movieId = movieId;
        // 定义一个字段到模型的映射
        const attrToModel = {
            'directors':'Directors',
            'covers':'Covers',
            'actors':'Actors'
        }
        // 字段列表
        const attrs = Object.keys(attrToModel);
        console.log('attrs==>',attrs)

        // 生成需要的movie数据
        for(let key in req.body){
            if(!attrs.includes(key)){

                // 去除掉isEdit 这个字段
                if(key == 'isEdit') continue;

                movie[key] = req.body[key];
            }else{
                // 其他字段需要解格式化
                req.body[key] = JSON.parse(req.body[key]);
            }
        }

        movie.date = tool.formatDate(movie.date);

        // 电影数据成功创建
        console.log('请看电影数据==>',movie)

        // 下一步上传图片

        // 这里是图片上传的Promise
        const upLoadPromises = [];

        // 三个字段
        for(let i = 0; i < attrs.length ; i++){
            // 加入upLoadPromises中
            
            // 数组
            let arrData = req.body[attrs[i]];
            let len = req.body[attrs[i]].length;
            // ID名字
            let idname = `${attrs[i].slice(0,-1)}Id`
            for(let j = 0; j < len; j++){

                if(!!arrData[j].type){
                    // 加入一个电影id字段
                    arrData[j].movieId = movieId;

                    // 加入特殊id
                    arrData[j][idname] = tool.createdId(`${attrs[i].slice(0,3)}`)

                    // 先删除一下url
                    // delete arrData[j].url;
                    // 上传图片
                    upLoadPromises.push(tool.upLoadImg(arrData[j]));
                }

            }
        }

        console.log('req.body.isEdit==>',req.body.isEdit)
        // 等待图片上传完毕后
        Promise.all(upLoadPromises)
        .then(()=>{
            // 开启事务处理 t事务处理对象
            if(req.body.isEdit == "1"){
                console.log("我居然惊了")
                // 这里是更新
                // 万事具备，只差写入
                console.log("movie==>",movie)
                console.log("movieId==>",movieId)



                api.transaction(t =>{

                    return api.updateData('Movie',movie,{
                        // 条件
                        movieId
                    },t)
                    .then(()=>{
                        // 继续更新三个表
                        const allPromise = [];
                        for(let j = 0; j < attrs.length ; j++){
                            let arrData = req.body[attrs[j]];
                            // attr 是数据
                            let attr = attrs[j];           
                            let keyId = attrs[j].slice(0,-1) + 'Id';
                            for(let k = 0; k < arrData.length ; k++){
                                let obj = {};
                                obj[keyId] = arrData[k][keyId];
                                delete arrData[k][keyId]
                                allPromise.push(api.updateData(attrToModel[attr],arrData[k],obj,t));
                            }
                        }

                        return Promise.all(allPromise)

                    })

                })
                .then(()=>{

                    res.send({msg:"更新电影成功",code:3300})
                })
                .catch(()=>{
                    res.send({msg:"更新电影失败",code:3301})
                })  

            }else{
                console.log("我居然哇了")
                // 这里是新创建
                api.transaction(t =>{
                    // 先写入movie表
                    return api.createData('Movie',movie,t)
                    .then(()=>{
                        // 然后继续写入三表
                        const allPromise = [];

                        for(let j = 0; j < attrs.length ; j++){
                            let arrData = req.body[attrs[j]];
                            // attr 是数据类型
                            let attr = attrs[j];
                            
                            for(let k = 0; k < arrData.length ; k++){
                                allPromise.push(api.createData(attrToModel[attr],arrData[k],t));
                            }
                        }

                        return Promise.all(allPromise)
                    })
                })
                .then(()=>{

                    res.send({msg:"发布电影成功",code:2000})
                })
                .catch(()=>{
                    res.send({msg:"发布电影失败",code:2001})
                })             
            }


        })
        .catch(()=>{
           res.send({msg:"图片上传失败",code:2002})
        })
    
    }

    // 查看电影详情
    lookMovieControl(req,res){
        // 我们来这里开始三个表结构查询
        // 先查电影表
        // SELECT * FROM `movie` WHERE `movie`.`movie_id` = 'ai_movie487031588724991'
        let tableName = ['movie','directors','covers','actors'];

        // 所有的promise
        let promise = [];

        const id = req.body.id;

        for(let i = 0; i < tableName.length ; i++){
            let sql = null;
            if(i == 0){
                sql = "SELECT movie.movie_id,movie.`name`,movie.enname,movie.`desc`,movie.movie_type,movie.duration,movie.date,movie.`mode`,movie.`status`,movie.created_at,movie.updated_at FROM `movie` WHERE `movie`.`movie_id` = :id;";
            }else{
                let tableId = tableName[i].slice(0,-1) + '_id';
                sql = `SELECT d.${tableId}, d.movie_id, d.url, d.text FROM ${tableName[i]} AS d WHERE d.movie_id = :id;` 
            }

            promise.push(api.query(sql,{
                id
            }))
        }

        Promise.all(promise)
        .then(result=>{
            let movieData = {};

            // 构造一下返回数据
            for(let i = 0; i < tableName.length;i++){
                 
                if(i == 0){
                    // 处理一下数据_toB
                    for(let key in result[i][0]){
                        movieData[tool._toB(key)] = result[i][0][key]
                    }

                }else{
                    movieData[tableName[i]] = [];
                    // 数组
                     for(let j = 0; j < result[i].length ; j++){
                        let o = {};
                             // 处理一下数据_toB
                        for(let key in result[i][j]){
                            o[tool._toB(key)] = result[i][j][key]
                        }

                        movieData[tableName[i]].push(o)
                     } ;
                }
            }

            console.log("movieData==>",movieData)

            res.send({msg:"查看电影详情成功",code:3200,result:movieData})

        })
        .catch(err =>{

             res.send({msg:"查看电影详情失败",code:3201})
        })
    }

    // 上下架电影
    upOrDownControl(req,res){
        // 更改上下架状态
        let movieId = req.body.movieId;
        let status = req.body.status;

        if(status == "上架"){
            status = "下架"
        }else{
            status = "上架"
        }

        api.updateData('Movie',{status},{movieId})
        .then(()=>{
            res.send({msg:`电影成功${status}`,code:"3500",result:status})
        })
        .catch(()=>{
            res.send({msg:`电影${status}失败`,code:"3501"})
        })
    }

    // 删除电影
    deleteMovieControl(req,res){

        // 根据电影id删除所有
        let movieId = req.body.movieId;

        // 开启事务处理
        api.transaction(t=>{
            // 先删除电影表
            return api.destroyData('Movie',{movieId},t).
            then(()=>{

                // 继续删除三个表
                const allPromise = [];

                // 定义一个数组
                const modelName = ['Actors','Directors','Covers']



                for(let i = 0; i < modelName.length ; i++){

                        allPromise.push(api.destroyData(modelName[i],{movieId},t));

                    }

                return Promise.all(allPromise)

            })
        })
        .then(()=>{
            res.send({msg:"删除电影成功",code:3400})
        })
        .catch(()=>{
             res.send({msg:"删除电影失败",code:3401})
        })    
    }


    // 上传头像
    uploadAvatarControl(req,res){

        // 处理图像数据
        console.log("req.body==>",req.body)
        tool.upLoadImg(req.body)
        .then(()=>{
            console.log('result==>',req.body)

            const avatar = req.body.url;

            const userId = req.body.userId;

            // 根据这个req.body去更新bussiness表
            api.updateData('Business',{avatar},{userId})
            .then(()=>{
                res.send({msg:"上传头像成功",code:4000,avatar})
            })
            .catch(()=>{
                res.send({msg:"上传头像失败",code:4001})
            })
        })
        .catch(()=>{
            res.send({msg:"上传头像失败",code:4001})
        })
        
    }

}

module.exports = new RouterControler();