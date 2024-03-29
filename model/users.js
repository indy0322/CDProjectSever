const mongoose = require('mongoose')

const {Schema} = mongoose

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    code: {
        type: String,
        require: true
    },
    language1: {
        type: String
    },
    language2: {
        type: String
    }
})

mongoose.model('Users',userSchema)