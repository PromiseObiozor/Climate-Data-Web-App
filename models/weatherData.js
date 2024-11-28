const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const weatherDataSchema = new mongoose.Schema({
    cityId: {type: mongoose.Schema.Types.ObjectID,
             ref: "city",
             required: [true, 'City ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    temperature: {
        type: Number,
        required: [true, 'Temperature is required']
    },
    humidity: {
        type: Number,
        required: [true, 'Humidity is required']
    },
    windSpeed: {
        type: Number,
        required: [true, 'Wind speed is required']
    },
    conditions: {
        type: String,
        required: [true, 'Conditions are required']
    }
});

module.exports = mongoose.model("WeatherData", weatherDataSchema);