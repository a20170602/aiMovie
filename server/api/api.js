// 服务层

// 导入模型,操作数据库

const model = require(__basename + '/db/model/model.js')

// 数据库（增删改查）
class API {
	// 创建数据 事务处理
	createData(modelName,o,t){
		// modelName:模型名称，string
		// o:创建记录数据，object
		// 返回一个promise
		//t: 事务处理对象
		return model[modelName].create(o,{transaction: t});
	}
	// 查询条件
	findData(modelName,o,attr){
		// attr是一个返回属性的数组
		return model[modelName].findAll({
			where:o,
			attributes:attr
		})
	}
	// 删除数据
	destroyData(modelName,o,t){
		return model[modelName].destroy({
		  where: o,
		  transaction: t
		})
	}

	  //更新数据
	updateData(modelName, value, o, t) {
	  //modelName： 模型名称, string
	  //value: 更新的字段数据，object
	  //o: 更新条件，object
	  //t: 事务处理对象
	    return model[modelName].update(value, {
	      where: o,
	      transaction: t
	    });
	  }

	// 事务处理
	transaction(fn) {
	   //fn(t) {}, t: 事务处理对象
	   return sequelize.transaction(fn);
	 }

	 //原始查询
	 query(sql,o){
	 	// sql:sql语句,string
	 	// o:sql预处理值
	 	console.log("o==>",o)
	 	return sequelize.query(sql,{
	 		// bind:sql预处理
	 		replacements:o,
	 		type:sequelize.QueryTypes.SELECT
	 	})
	 }

}

module.exports = new API();