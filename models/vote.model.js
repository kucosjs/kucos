const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema(
  {
    msgid: {
      type: String
    },
    userid: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vote', voteSchema);