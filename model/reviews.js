const mongoose = require('mongoose')

const {Schema} = mongoose

const reviewSchema = new Schema({
    nickname: {
        type: String,
        require: true
    },
    tourname: {
        type: String,
        require: true,
        unique: true
    },
    review: {
        type: String,
        require: true
    }
})

mongoose.model('Reviews',reviewSchema)