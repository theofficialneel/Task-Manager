var mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: { 
        type: String
    },
    timestamp : { 
        type : Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Task', taskSchema);