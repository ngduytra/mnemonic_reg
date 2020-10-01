const mongoose = require('mongoose');
const {Schema} = mongoose;

const userMnemonicSchema = new Schema({
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    useragents: [{
        useragent:{
            type: String,
            required: true
        }
    }],
    mnemonic:{
        type: String,
        trim: true
    },
    confirmed:{
        type: Boolean,
        default: false,
    }
})
userMnemonicSchema.statics.findByCredentials = async (useragent, password) => {
    const user = await User.findOne({ password,'useragents.useragent': useragent })

    if (!user) {
        throw new Error('Unable to login')
    }

    return user
}

const UserMnemonic = mongoose.model('UserMnemonic', userMnemonicSchema)

module.exports = UserMnemonic
