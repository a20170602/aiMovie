// 模型的汇总文件，在这里统一管理

const Business = require(__basename + '/db/model/business.js');
const Code = require(__basename + '/db/model/Code.js')
const Actors = require(__basename + '/db/model/actors.js')
const Movie = require(__basename + '/db/model/movie.js')
const Covers = require(__basename + '/db/model/covers.js')
const Directors = require(__basename + '/db/model/directors.js')


// 导出
module.exports = {
	Business,
	Code,
	Actors,
	Movie,
	Covers,
	Directors
}
