// 工具库 存储公共方法，基本服务于routerControl

const crypto = require('crypto');

// 生成token模块
const jwt = require('jsonwebtoken');

// 导入发邮件模块
const nodemailer = require("nodemailer");

const fs = require("fs")

// 导入API服务层
const api = require(__basename + '/api/api.js');

// 创建发邮件实例
let transporter = nodemailer.createTransport({
    host:config.emailOptions.host,
    port: config.emailOptions.port,
    secure: config.emailOptions.secure, // true for 465, false for other ports
    auth:{
    	user:config.emailOptions.user,
    	pass:config.emailOptions.pass
    }
});

class Tool {
	constructor(){}

	encodeString(data,salt){

		const md5 = crypto.createHash('md5');

		const newMd5 = md5.update(data + salt).digest('hex');

		return newMd5;
	}

	// 发邮件
	sendEmail(options,fn){
		// options接受邮件配置
		// fn(err,data)
		transporter.sendMail(options,fn);
	}

	 // 生成六位随机验证码

	// 生成邮箱验证码
    generateValidCode(){
        const code = Math.random().toString().slice(-6);

        return code;
    }

    // 获取最开始的路劲
    getOriginRouter(str){
    	return str.split('?')[0];
    }

    // 生成token
    generateToken(o){
    	/*
    	o.data, 加密数据
    	o.salt, 加盐
    	o.expiresIn 过期时间
    	o.fn 回调函数
    	*/ 
    	jwt.sign({
    		data:o.data
    	}, o.salt, { expiresIn: o.expiresIn }, o.fn);
    }

    // 获取格式化的cookie
    formatCookie(cookie){
    	let arr = cookie.split(/; /);
    	let obj = {}
    	arr.forEach((v,i)=>{
    		let temp = v.split('=');
    		obj[temp[0]] = temp[1];
    	})

    	return obj;
    }

    // 验证token是否正确
    validfyToken(o){
    	/*
			o.token
			o.salt
			o.fn
    	*/
    	jwt.verify(o.token,o.salt, o.fn);
    }

    // 上传图片方法
    upLoadImg(o){
        // 最后一步封装成一个promise

        return new Promise((resolve,reject)=>{
                        // 1.0将url的空格转换为加号
                        // 所有字符串方法都不改变自身
                        o.url = o.url.replace(/data:image\/[A-Za-z]+;base64,/, "");

                        let base64 = o.url.replace(/ /g,'+');
                        // 2.0转成成buffer
                        let buffer = Buffer.from(base64, 'base64');

                        const baseUrl =  config.serverOptions.host + ':' + config.serverOptions.post + '/static/';

                        // 定义文件名
                        const fileName = this.createdId('_fid') + '.' + o.type;

                        console.log('fileName==>',fileName)

                        // 写入fs文件系统
                        fs.writeFile(__basename + '/upload/' + fileName,buffer, (err)=>{
                            if(err){
                                reject();
                            }else{
                                // 修正url
                                o.url = baseUrl + fileName;
                                delete o.type;
                                resolve();
                            }
                        })       
                    })

    }

    // 创建一个独立文件名
    createdId(before){
        // 前缀加随机数加时间戳
        return before + Math.random().toString().slice(-5) + +new Date();
    }

    // 这里定义一个formatDate的方法
    formatDate(date){
        let newDate = new Date(date);

        return `${newDate.getFullYear()}-${this.addZero(newDate.getMonth()+1)}-${this.addZero(newDate.getDate())}`
    }

    addZero(num){
        return num >= 10 ? num : '0' + num;
    }

     _toB(str){
            let arr = str.split('');
            let newStr = '';
            for(let i = 0 ; i < arr.length ; i++){
                if(arr[i] == '_' && i !=  arr.length-1){
                    arr[i+1] = arr[i+1].toUpperCase();
                }
            }
            newStr = arr.join('').replace(/_/g,'')


            return newStr
    }


     // 解决403图片缓存问题
    getImages(_url) {
        if (_url !== undefined) {
            let _u = _url.substring(7);
            return 'https://images.weserv.nl/?url=' + _u;
        }
    }

    loadMovie(movie){

        // 导入电影方法
        let promiseAll = []
        for (let key in movie){ 
            movie[key]['userId'] = movie[key]['user_id']
            movie[key]['movieType'] = movie[key]['movie_type']
            movie[key]['movieId'] = movie[key]['movie_id']
            movie[key].desc =  movie[key].desc.replace(/\s/g,'');
            // 去空白符
            promiseAll.push(api.createData('Movie',movie[key]))
        }

        Promise.all(promiseAll)
        .then(()=>{
            console.log('上传成功')
        })
    }

    loadOther(model,typeId,data){
        let promiseAll = []
        for (let key in data){ 
            data[key][this._toB(typeId)] = data[key][typeId]
            data[key]['movieId'] = data[key]['movie_id']
            data[key].url = this.getImages(data[key].url)
            // 去空白符
            promiseAll.push(api.createData(model,data[key]))
        }

        Promise.all(promiseAll)
        .then(()=>{
            console.log('上传成功')
        })

    }   
    // 生成管理员账号
    gengeationAdmin({adminName,password,email,nickname}){
         // 验证当前邮箱是否已经被注册
        api.findData('Business',{
            email,
        }).then(result =>{
            if(result.length == 0){
                        api.createData('Business', {
                            userId:adminName,
                            password:this.encodeString(password,config.saltOptions.passwordSalt),
                            email,
                            nickname,
                        }).then(result => {
                            console.log("生成成功")
                        }).catch(err => {
                            console.log("生成失败")
                        })
            }else{
                console.log('邮箱已经被注册')
            }

        }).catch(()=>{
            console.log('管理员注册出错');
        })
        
              
    }
}

// 导出工具库
module.exports = new Tool();