const mongoose = require("mongoose")
const objId = mongoose.Schema.Types.ObjectId;
const StaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    price: {
      adult: {
        type: Number,
        required: true,
      },
      children: {
        type: Number,
        required: true,
      }
    },
    maxPeople: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    rooms: [{
      bedType: {
        type: String,
        enum: ["King", "Queen", "Master", "none"]
      },
      occupants: {
        type: Number,
        required: true
      }
    }],
    roomNumbers: [{
      type: Number
    }],
    closedDates: [{
      type: String,
    }],
    status: {
      type: Boolean,
      default: false
    },
    owner:{
      type:objId,
      ref:"User",
      required:true
  }
  },
  { timestamps: true }
);
const Stay = mongoose.model("Stay", StaySchema);

module.exports = Stay