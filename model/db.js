const mongoose = require('mongoose')

const connect = () => {
    if(process.env.NODE_ENV !== 'production'){
        
    }//개발모드가 아닌 배포 모드에서 필요한 코드


    const dbURI = 'mongodb+srv://myatlasdbuser:myatlasdbuser@cluster0.qaz81mk.mongodb.net'  
    mongoose.connect(dbURI,{dbName: 'testproject'})

    mongoose.connection.on('connected',function(){
        console.log('MongoDB 연결이 되었습니다 : ' + dbURI)
    })

    mongoose.connection.on('error',(error) => {
        console.error(error)
    })

    mongoose.connection.on('disconnected', () => {
        console.error('MonogoDB 연결이 종료되어 연결을 재시도 합니다.')
        connect()
    })
    
}

require('./users')
require('./reviews')
require('./wishlist')

module.exports = {
    connect
}