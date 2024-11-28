const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new mongoose.Schema({
    name:  { 
        type: String,
        required: [true, "City name is required"],
        unique: true
    },
    country: String,
    coordinates: {
        lat: Number,
        lon: Number
    }
});

module.exports = mongoose.model("City", citySchema);