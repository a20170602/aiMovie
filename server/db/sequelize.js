// 数据库


// 导入
const Sequelize = require('sequelize');

// 建立连接
const sequelize = new Sequelize(config.dbOptions.database, config.dbOptions.user, config.dbOptions.password, {
    host: config.dbOptions.host,
    dialect: config.dbOptions.dialect,
    pool: config.dbOptions.pool,
    timezone:config.dbOptions.timezone
});

// 导出
module.exports = sequelize;