// 按城市获取记录
module.exports = function(req, res, next, db) {
    // res.send('a')
    const CurrentData = db.model('current_data_now');

    getInfo()

    async function getInfo(){
        try{
            let data = await CurrentData.find({}).lean().exec()
            result =[]
            for(let item of data){
                result.push({
                    type:'Feature',
                    properties:{
                        province:item.province,
                        basin:item.basin,
                        station_name:item.station_name,
                        monitoring_time: item.monitoring_time,
                        water_category: item.water_category,
                        PH: item.PH,
                        dissolved_oxygen: item.dissolved_oxygen,
                        conductivity: item.conductivity,
                        turbidity: item.turbidity,
                        Hypermanganate_index: item.Hypermanganate_index,
                        ammonia_nitrogen: item.ammonia_nitrogen,
                        total_phosphorus: item.total_phosphorus,
                        total_nitrogen: item.total_nitrogen,
                        Chlorophyll: item.Chlorophyll,
                        algal_density: item.algal_density,
                        station_stat: item.station_stat,
                        city_area: item.city_area,
                        river: item.river,
                        address: item.address,
                    },
                    geometry:{
                        type:'Point',
                        coordinates:[item.loc[0],item.loc[1]]
                    }
                })
            }
            res.send({
                status: true,
                data: result
            });

        }catch(err){
            failHandle(0,err.message.toString())
        }

    }

    // 登录失败
    // reason: 登录失败原因
    //   0: 数据库错误
    //   1: 查找不到用户名
    //   2: 密码错误
    //   3: 数据输入错误
    // message: 错误信息
    function failHandle( reason, message='' ) {

        res.send({
            status: false,
            reason: reason,
            message: message,
        });
    }

};