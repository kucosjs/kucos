const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const kudoSchema = new Schema({
  kudos: {
    type: Number,
    default: 0
  },
  article_id: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Kudo", kudoSchema);
