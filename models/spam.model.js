const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const spamSchema = new Schema({
  comment_id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Spam", spamSchema);
