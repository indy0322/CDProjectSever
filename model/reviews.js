const mongoose = require('mongoose')

const {Schema} = mongoose

const reviewSchema = new Schema({
    nickname: {
        type: String,
        require: true
    },
    tourId: {
        type: String,
        require: true,
    },
    langCode: {
        type: String,
        require: true
    },
    date:{
        type: String,
        require: true
    },
    review: {
        type: String,
        require: true
    }
})

mongoose.model('Reviews',reviewSchema)