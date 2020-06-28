const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const statsSchema = new Schema({
  article_id: {
    type: String,
    required: true,
    maxlength: 2000
  },
  totalComments: {
    type: Number,
    default: 0
  },
  totalReports: {
    type: Number,
    default: 0
  },
  totalSpam: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Stats", statsSchema);
