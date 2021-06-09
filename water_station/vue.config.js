module.exports = {
    lintOnSave: false,
    // // webpack 相关配置
    // configureWebpack: config => {
    //     if (process.env.NODE_ENV === 'production') {
    //       // 为生产环境修改配置...
    //     } else {
    //       // 为开发环境修改配置...
    //     }
    // },
    devServer: {
        clientLogLevel: 'info',
        port: 8080,
        host: "localhost",
        disableHostCheck:true,
        https: false,
        open: false,
        proxy: {
            "/users": {
                target: 'http://localhost:3000/users',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    "^/users": ""
                }
            }
        }
    },
    //生产环境的配置
    productionSourceMap:false,
}
