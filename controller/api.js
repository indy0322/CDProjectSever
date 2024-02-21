const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const Users = mongoose.model('Users')
const Reviews = mongoose.model('Reviews')

const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')


const apiNode = (req, res) => {
    res.send('반갑습니다.')
}

const apiNodeTest = (req, res) => {
    console.log(req.body.title)
}

const apiLogin = (req, res, next) => {
    const key = "rkGU45258GGhiolLO2465TFY5345kGU45258GGhiolLO2465TFY5345"

    const nickname = req.body.id
    const profile = req.body.pw
    let token

    token = jwt.sign({
        type: "JWT",
        nickname: nickname,
        profile: profile
    },key,
    {
        expiresIn: "1m",
        issuer: "토큰발급자"
    }
    )
    
    return res.status(200).json({
        code: 200,
        token: token
    })
}

const auth = (req, res, next) => {
    const key = "rkGU45258GGhiolLO2465TFY5345kGU45258GGhiolLO2465TFY5345"

    try{
        req.decoded = jwt.verify(req.headers.authorization, key)
        return next()
    } catch(err){
        if(err.name === "TokenExpiredError"){
            return res.status(419).json({
                code: 419,
                message: "토큰이 만료됨"
            })
        }
        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                code: 401,
                message: "유효하지 않은 토큰"
            })
        }
    } 
}

const apiAuth = (req, res) => {
    const nickname = req.decoded.nickname
    const profile = req.decoded.profile

    return res.status(200).json({
        code: 200,
        message: "정상 토큰",
        data: {
            nickname: nickname,
            profile: profile
        }
    })
}

const apiRegister = (req, res) => {
    Users.findOne({email:req.body.email}).exec((err,user) => {
        if(err){
            console.log(err)
        }
        if(user){
            console.log(user.name)
            return res.json({"message":"존재하는 회원"})
        }else{
            Users.create({name:req.body.name, email:req.body.email, password:req.body.password},(err) => {
                if(err){
                    return res.json(err)
                }
                return res.json('회원가입 완료')
            })
        }
    })
       
}

const apiReviewRegister = (req, res) => {
    Reviews.create({nickname:req.body.nickname, tourname:req.body.tourname, review:req.body.review},(err) => {
        if(err){
            return res.json(err)
        }
        return res.json('리뷰등록 완료')
    })
} 


const apiAudio = async (req, res) => {
    //tts 사용시 이 openai코드를 사용해야함.
    /*const openai = new OpenAI({
        apiKey: '',
        dangerouslyAllowBrowser: true
    })

    const speechFile = path.resolve("./audiofile/speech2.mp3")

    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: "你好"
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    await fs.promises.writeFile(speechFile,buffer)*/

    
    


    //tts 사용시 이 코드를 사용해야함.
    res.writeHead(200,{"Content-Type": "audio/mpeg"})
    const file = fs.createReadStream('./audiofile/kakao.mp3')
    file.pipe(res)

    //tts 파일을 만들고 지워주어야함.
    //fs.unlink('./audiofile/speech2.mp3', (err) => {if(err) throw err})





     /*const file = fs.readFileSync('./audiofile/kakao.mp3')
    res.writeHead(200,{"Content-Type": "audio/mpeg"})
    res.write(file)
    
    res.end()*/

    /*fs.readFile('./audiofile/speech1.mp3',function(err, result){
        console.log(result.toString("base64"))
        res.send(result.toString("base64"))
    })*/

    
    
}

module.exports = {
    apiNode,
    apiNodeTest,
    apiLogin,
    auth,
    apiAuth,
    apiRegister,
    apiReviewRegister,
    apiAudio
}