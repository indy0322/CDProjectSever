const mongoose = require('mongoose')

const {Schema} = mongoose

const wishlistSchema = new Schema({
    nickname: {
        type: String,
        require: true
    },
    tourId: {
        type: String,
        require: true,
    },
    tourAddress: {
        type: String,
        require: true
    },
    tourImage:{
        type: String,
        require: true
    },
    tourX: {
        type: String,
        require: true
    },
    tourY: {
        type: String,
        require: true
    },
    tourTitle: {
        type: String,
        require: true
    }
})

mongoose.model('Wishlist',wishlistSchema)