const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const commentSchema = new Schema({
  article_id: {
    type: String,
    required: true,
    maxlength: 1000
  },
  author: {
    type: String,
    maxlength: 1000,
    default: "Anonymous"
  },
  comment: {
    type: String,
    required: true,
    maxlength: 5000
  },
  email: {
    type: String,
    required: false,
    maxlength: 1000
  },
  website: {
    type: String,
    required: false,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    maxlength: 1000
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  userid: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Comment", commentSchema);
