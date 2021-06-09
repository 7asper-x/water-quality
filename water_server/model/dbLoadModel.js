const mongoose = require('mongoose');

module.exports = function(db) {
    // 空气质量相关数据

    {
        // 最新数据
        let data = require('./dbmodel/current_data_now.js');
        let schema = mongoose.Schema(data.schema);
        db.model('current_data_now', schema, 'current_data_now');
    }
};