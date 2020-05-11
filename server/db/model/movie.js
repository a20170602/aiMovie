// 电影表

// 1.0先要导入sequlize
const Sequelize = require('sequelize');

// 2.0拿到Module类
const Model = Sequelize.Model;

// 3.0定义个体模型继承模型
class Movie extends Model { }

// 定义模型结构，就是mysql表结构
// 参数有两个对象，一个是表结构，一个是配置
Movie.init(
	{
		// integer整型 unsigned无符号
		id: {
			type: Sequelize.INTEGER.UNSIGNED,

			// 主键
			primaryKey: true,

			// 自动递增
			autoIncrement: true,

			// 允许为null
			allowNull: false,

			// 注释
			comment: '自增id'
		},
		movieId: {
			// 定义数据类型
			type: Sequelize.STRING(30),
			allowNull: false,
			// 默认值
			defaultValue: '',
			comment: '电影id'

		},
		userId: {
			// 定义数据类型
			type: Sequelize.STRING(30),
			allowNull: false,
			// 默认值
			defaultValue: '',
			comment: '用户id'

		},
		
		name: {
			type: Sequelize.STRING(30),
			allowNull: false,
			defaultValue: '',
			comment: '电影中文名称'
		},
		enname: {
			type: Sequelize.STRING(100),
			allowNull: false,
			defaultValue: '',
			comment: '电影英文名称'
		},
		desc: {
			type: Sequelize.STRING(1234),
			allowNull: false,
			defaultValue: '',
			comment: '电影简介'
		},
		movieType:{
		  	type: Sequelize.STRING(50),
	      	allowNull: false,
	      	defaultValue: '',
	      	comment: '电影类型'
		},
		duration: {
	      type: Sequelize.STRING(10),
	      allowNull: false,
	      defaultValue: '',
	      comment: '电影时长'
	    },
		date:{
			type: Sequelize.DATEONLY,
	      	allowNull: false,
	      	comment: '上映日期'
		},
		mode: {
	      	type: Sequelize.STRING(10),
	      	allowNull: false,
	      	defaultValue: '',
	      	comment: '电影模式'
	    },
	    status: {
	      	type: Sequelize.STRING(10),
	      	allowNull: false,
	      	defaultValue: '',
	      	comment: '电影状态'
	    }
	},
	{
		// 模型名称
		modelName: 'movie',

		// 添加createdAt、updatedAt字段
		timestamps: true,

		// 当表字段是驼峰式命名时，使用_风格命名表字段
		underscored: true,

		// 禁止sequlize自动修改表名为复数
		freezeTableName: true,

		// 定义表名，如果不写，则使用modelName模型名称
		tableName: 'movie',

		// 连接实例
		sequelize: sequelize
	})

// 同步mysql数据
// force:false ==>  如果表结构存在，则不创建
// force:true ==> 如果表结构存在，先删除，再创建

Movie.sync({
	force: false
})

// 导出模型
module.exports = Movie;