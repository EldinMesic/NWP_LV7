
const mongoose = require("mongoose");

var projectSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        description: String,
        price: {
            type: Number,
            min: [0, "Price can't be negative"],
            required: true
        },
        completed_jobs: String,
        start_date: {
            type: String,
            required: true
        },
        end_date: String,
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        archived: {
            type: Boolean,
            default: false
        }
});

const Project = mongoose.model('Project', projectSchema );
module.exports = Project;