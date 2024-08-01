const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const Users = mongoose.model('Users')
const Reviews = mongoose.model('Reviews')
const Wishlist = mongoose.model('Wishlist')
const nodemailer = require('nodemailer')
const https = require('https')

const agent = new https.Agent({
    rejectUnauthorized: false
})

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



const fs = require('fs')
const path = require('path')
const OpenAI = require('openai');
const { default: axios } = require('axios');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: "indy0322230@gmail.com",
        pass: "",
    }
})


const apiNode = (req, res) => {
    res.send('반갑습니다.')
}

const apiNodeTest = (req, res) => {
    console.log(req.body.title)
}

const apiLogin = (req, res, next) => {
    const key = "rkGU45258GGhiolLO2465TFY5345kGU45258GGhiolLO2465TFY5345"
    console.log(req.body.email, req.body.password)

    if(req.body.email != ''){
        Users.findOne({email:req.body.email}).exec((err,user) => {
            if(err){
                console.log(err)
            }
            if(user){
                if(user.password == req.body.password){
                    console.log(user)
                    let token
                    token = jwt.sign({
                        type: "JWT",
                        email: user.email,
                        code: user.code,
                        language1: user.language1,
                        language2: user.language2
                    },key,
                    {
                        expiresIn: "120m",
                        issuer: "토큰발급자"
                    })
                    return res.status(200).send(token)
                }else{
                    return res.send('wrong password')
                }
                
            }else{
                return res.send('non-existent member')
            }
        })
    }
    
    /*const nickname = req.body.id
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
    })*/
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
    const email = req.decoded.email
    const code = req.decoded.code
    const language1 = req.decoded.language1
    const language2 = req.decoded.language2
    console.log(email, code, language1, language2)

    return res.status(200).json({
        code: 200,
        message: "정상 토큰",
        data: {email: email, code: code, language1: language1, language2: language2}
    })
}

const apiRegister = (req, res) => {
    console.log(req.body.email,req.body.password,req.body.code,req.body.language1,req.body.language2)
    if(req.body.email == '' || req.body.password == ''){
        return res.json("Please enter it correctly")
    }
    Users.findOne({email:req.body.email}).exec((err,user) => {
        if(err){
            console.log(err)
        }
        if(user){
            return res.json("existing member")
        }else{
            Users.create({email:req.body.email, password:req.body.password, code:req.body.code,language1:req.body.language1,language2:req.body.language2},(err) => {
                if(err){
                    return res.json(err)
                }
                return res.json('registration completed')
            })
        }
    })
       
}

const apiReviewRegister = (req, res) => {
    console.log(req.body.nickname, req.body.tourId, req.body.langCode,req.body.date,req.body.review)
    Reviews.create({nickname:req.body.nickname, tourId:req.body.tourId, langCode:req.body.langCode,date:req.body.date,review:req.body.review},(err,review) => {
        if(err){
            console.log(err)
            return res.json(err)
        }
        if(review){
            //console.log(review)
            return res.json('리뷰등록 완료')
        }
    })
}

const apiReviewRemove = (req, res) => {
    console.log(req.body.date)
    Reviews.deleteOne({date:req.body.date}).exec((err,review) => {
        if(err){
            console.log(err)
        }
        if(review){
            return res.json('리뷰삭제 완료')      
        }
    })
}

const apiReviewInfo = (req, res) => {
    console.log(req.body.tourId)
    Reviews.find({tourId:req.body.tourId}).exec((err, review) => {
        if(err){
            console.log(err)
            return res.json(err)
        }
        if(review){
            //console.log(review)
            return res.json(review)
        }else{
            return res.json([])
        }
    })
    //return res.json('리뷰 가져오기 완료')
}

const apiWishRegister = (req, res) => {
    //console.log(req.body.tourId, req.body.tourAddress, req.body.tourImage, req.body.tourX, req.body.tourY, req.body.tourTitle)
    Wishlist.findOne({nickname:req.body.nickName, tourId:req.body.tourId}).exec((err, one) => {
        if(err){
            return res.json(err)
        }
        if(one){
            return res.json('이미 위시리스트에 등록됨')
        }else{
            Wishlist.create({nickname:req.body.nickName, tourId:req.body.tourId, tourAddress:req.body.tourAddress, tourImage:req.body.tourImage, tourX:req.body.tourX, tourY:req.body.tourY, tourTitle:req.body.tourTitle, date:req.body.date},(err, wish) => {
                if(err){
                    console.log(err)
                    return res.json(err)
                }
                if(wish){
                    console.log(wish)
                    return res.json('위시리스트 등록 완료')
                }
            })
        }
    })
    
}

const apiWishRemove = (req, res) => {
    Wishlist.deleteOne({nickname: req.body.nickName, tourId: req.body.tourId}).exec((err, wish) => {
        if(err){
            console.log(err)
        }
        if(wish){
            return res.json('위시리스트에서 삭제 완료')      
        }
    })
}

const apiWishRemove2 = (req, res) => {
    Wishlist.deleteOne({date: req.body.date}).exec((err, wish) => {
        if(err){
            console.log(err)
        }
        if(wish){
            return res.json('위시리스트에서 삭제 완료')
        }
    })
}

const apiWishInfo = (req, res) => {
    Wishlist.find({nickname: req.body.nickName}).exec((err, wish) => {
        if(err){
            console.log(err)
            return res.json(err)
        }
        if(wish){
            console.log(wish)
            return res.json(wish)
        }else{
            return res.json([])
        }
    })
}

const apiAuthNumber = (req,res) => {
    if(req.body.email){
        
        transporter.sendMail({
            from: "indy0322230@gmail.com",
            to: req.body.email,
            subject: `Korea EasyTrip's authentification number`,
            text: `${req.body.number}` 
        })
        return res.send("number sent completed")
    }
    else{
        return res.send("Failed to send number")
    }
    
}


const apiAudio = async (req, res) => {
    //tts 사용시 이 openai코드를 사용해야함.
    const openai = new OpenAI({
        apiKey: process.env.CHATGPTKEY,
        dangerouslyAllowBrowser: true
    })

    const speechFile = path.resolve("./audiofile/speech2.mp3")

    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: req.body.speak
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    await fs.promises.writeFile(speechFile,buffer)

    
    


    //tts 사용시 이 코드를 사용해야함.
    res.writeHead(200,{"Content-Type": "audio/mpeg"})
    const file = fs.createReadStream('./audiofile/speech2.mp3')
    file.pipe(res)

    //tts 파일을 만들고 지워주어야함.
    /*setTimeout(() => {
        fs.unlink('./audiofile/speech2.mp3', (err) => {if(err) throw err})
    },5000)*/
    





     /*const file = fs.readFileSync('./audiofile/kakao.mp3')
    res.writeHead(200,{"Content-Type": "audio/mpeg"})
    res.write(file)
    
    res.end()*/

    /*fs.readFile('./audiofile/speech1.mp3',function(err, result){
        console.log(result.toString("base64"))
        res.send(result.toString("base64"))
    })*/

    
    
}

const apiChangeLatLng = async (req, res) => {
    await axios.get(`https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${req.body.lng},${req.body.lat}&format=jsonp&type=both&zipcode=true&simple=false&key=${process.env.DIGITALTWIN}`)
        .then(async (res) => {
            //console.log(res.data)
            return await res.data.response.result
        })
        .then(async(response) => {
            console.log(await response)

            res.json(response)
        })
}

const apiHknuChatgpt = async (req, res) => {
    try {
        const response = await axios.post('https://cesrv.hknu.ac.kr/srv/gpt', {
            "service": "gpt",
            "question": `${req.body.tourTitle}을 ${req.body.language} 설명해`,
            "hash": `${req.body.key}`
        }, {
            headers: {'Content-Type': 'application/json'},
        });

        return res.json(response.data);

    } catch (error) {
        console.error('Error during API call:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    apiNode,
    apiNodeTest,
    apiLogin,
    auth,
    apiAuth,
    apiRegister,
    apiReviewRegister,
    apiAudio,
    apiAuthNumber,
    apiChangeLatLng,
    apiReviewInfo,
    apiReviewRemove,
    apiWishRegister,
    apiWishRemove,
    apiWishRemove2,
    apiWishInfo,
    apiHknuChatgpt
}