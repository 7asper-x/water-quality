module.exports = {

    // Running Environment (production, development)
    runningEnv: 'production',

    // using https
    https: false,
    // if you are using https, you should set the path of ssl/tls key and cert
    // openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
    httpsKey: 'https/key.pem',
    httpsCert: 'https/cert.pem',
    httpsPassphrase: '[Your passphrase]',

    // 80, 443, 3000
    port: 10008,

    // logger
    logger: true,
    logFolder: 'log',

    // Cookie (Not recommend)
    cookie: false,
    cookieSecret: '[Your cookie secret]',

    // Session
    session: true,
    sessionSecret: '[Your session secret]',
    sessionAge: 1000 * 60 * 60,

    // DB
    dbUsername: 'CityExam',
    dbPassword: 'CE,2020',
    dbName: 'CityExam',
    dbHost: 'localhost',
    dbPort: 20217,

    // euluc_DB
    eulucDBUsername: 'user',
    eulucDBPassword: 'euluc,2020',
    eulucDBName: 'euluc',
    eulucDBHost: '58.23.17.121',
    eulucDBPort: 20217,

    // air_DB
    airDBUsername: 'air_user',
    airDBPassword: 'bigdata,9056',
    airDBName: 'air_quality',
    airDBHost: '58.23.17.121',
    airDBPort: 20217,

    // water_DB
    waterDBUsername: 'water',
    waterDBPassword: 'bigdata,9056',
    waterDBName: 'water_quality',
    waterDBHost: '58.23.17.121',
    waterDBPort: 20217,


    // 数据存储文件夹路径
    dataDir: '../uploadData',

};