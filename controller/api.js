const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const Users = mongoose.model('Users')
const Reviews = mongoose.model('Reviews')
const Wishlist = mongoose.model('Wishlist')
const nodemailer = require('nodemailer')
const https = require('https')
const FormData = require('form-data')

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
    const key = process.env.TOKENKEY
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
    
}

const auth = (req, res, next) => {
    const key = process.env.TOKENKEY

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

const apiChangePassword = (req, res) => {
    
    Users.findOne({email:req.body.email, password: req.body.currentPassword}).exec((err, user) => {
        if(err){
            console.log(err)
        }
        if(user){
            
            Users.updateOne({email:req.body.email, password: req.body.currentPassword},{password:req.body.changePassword}).exec((err, user) => {
                if(err){
                    console.log('err2: ',err)
                }
                if(user){
                    return res.json('Member password has been changed')
                }
            })
        }else{
            return res.json('No members exist')
        }
    })
}

const apiChangeLang = (req, res) => {
    Users.findOne({email:req.body.email, password: req.body.currentPassword}).exec((err, user) => {
        if(err){
            console.log(err)
        }
        if(user){
            
            Users.updateOne({email:req.body.email, password: req.body.currentPassword},{code:req.body.code,language1:req.body.language1,language2:req.body.language2}).exec((err, user) => {
                if(err){
                    console.log('err2: ',err)
                }
                if(user){
                    return res.json('Member language has been changed')
                }
            })
        }else{
            return res.json('No members exist')
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
}

const apiWishRegister = (req, res) => {
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

const apiSpeechToText = async (req, res) => {
    try {
        const file = req.file
    
        if (!file) {
          return res.status(400).json({ message: '파일이 없습니다.' })
        }
    
        const formData = new FormData()
        formData.append('model', 'whisper-1')
    
        // ⭐ 핵심: buffer 사용
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
    
        const response = await axios.post(
          'https://api.openai.com/v1/audio/transcriptions',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${process.env.CHATGPTKEY}`,
            },
          }
        )
    
        res.json({
          text: response.data.text,
        })
    
      } catch (error) {
        console.error(error.response?.data || error)
        res.status(500).json({ message: 'Speech to Text 실패' })
      }
}

const apiChangeLatLng = async (req, res) => {
    await axios.get(`https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${req.body.lng},${req.body.lat}&format=jsonp&type=both&zipcode=true&simple=false&key=${process.env.DIGITALTWIN}`)
        .then(async (res) => {
            console.log(res.data)
            return await res.data.response.result
        })
        .then(async(response) => {
            console.log(await response)

            res.json(response)
        })
}

const apiTourSearch = async (req, res) => {
    try {
        const { keyword } = req.query;

        const encodedKeyword = encodeURIComponent(keyword);

        const url =
            `https://apis.data.go.kr/B551011/KorService2/searchKeyword2` +
            `?serviceKey=${process.env.TOUR_API_KEY}` +
            `&MobileOS=ETC` +
            `&MobileApp=APPTest` +
            `&_type=json` +
            `&numOfRows=15` +
            `&keyword=${encodedKeyword}`;

        const response = await axios.get(url);

        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ message: 'Tour API error' });
    }
};

const apiTourExplain = async (req, res) => {
    try {
      const { tourTitle, lang } = req.body
  
      if (!tourTitle || !lang) {
        return res.status(400).json({ message: '필수 값 누락' })
      }
  
      const openai = new OpenAI({
        apiKey: process.env.CHATGPTKEY
      })
  
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `${tourTitle}을 ${lang}로 설명해줘`
          }
        ],
        temperature: 1
      })
  
      res.json({
        text: response.choices[0].message.content
      })
  
    } catch (error) {
      console.error(error.response?.data || error)
      res.status(500).json({ message: 'Tour explain 실패' })
    }
  }

module.exports = {
    apiNode,
    apiNodeTest,
    apiLogin,
    auth,
    apiAuth,
    apiRegister,
    apiChangePassword,
    apiChangeLang,
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
    apiTourSearch,
    apiSpeechToText,
    apiTourExplain,
}