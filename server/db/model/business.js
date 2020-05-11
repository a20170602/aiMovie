// sequlize的模型，用来操作表的数据

// 1.0先要导入sequlize
const Sequelize = require('sequelize');

// 2.0拿到Module类
const Model = Sequelize.Model;

// 3.0定义个体模型继承模型
class Business extends Model { }

// 定义模型结构，就是mysql表结构
// 参数有两个对象，一个是表结构，一个是配置
Business.init(
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
		userId: {
			// 定义数据类型
			type: Sequelize.STRING(30),
			allowNull: false,
			// 默认值
			defaultValue: '',
			comment: '用户id'

		},
		email: {
			type: Sequelize.STRING(50),
			allowNull: false,
			defaultValue: '',
			comment: 'user_email'
		},
		password: {
			type: Sequelize.STRING(32),
			allowNull: false,
			defaultValue: '',
			comment: 'user_pwd'
		},
		nickname: {
			type: Sequelize.STRING(30),
			allowNull: false,
			defaultValue: '',
			comment: 'nickname'
		},
		avatar: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: config.userOptions.avatar,
			comment: 'avatar'
		}
	},
	{
		// 模型名称
		modelName: 'business',

		// 添加createdAt、updatedAt字段
		timestamps: true,

		// 当表字段是驼峰式命名时，使用_风格命名表字段
		underscored: true,

		// 禁止sequlize自动修改表名为复数
		freezeTableName: true,

		// 定义表名，如果不写，则使用modelName模型名称
		tableName: 'business',

		// 连接实例
		sequelize: sequelize
	})

// 同步mysql数据
// force:false ==>  如果表结构存在，则不创建
// force:true ==> 如果表结构存在，先删除，再创建

Business.sync({
	force: false
})

// 导出模型
module.exports = Business;