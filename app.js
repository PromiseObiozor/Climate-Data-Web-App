const mongoose = require("mongoose");
const express = require("express");
const City = require("./models/city");
const bodyParser = require("body-parser");
const WeatherData = require("./models/weatherData");
const { result } = require("lodash");

// Create the express app
const app = express();

const dbURI =
  "mongodb+srv://promise:12345@climate-change.twcgakb.mongodb.net/ClimateDataApp?retryWrites=true&w=majority&appName=Climate-Change";
mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((error) => console.log(error));

// view engine instructions
app.set("view engine", "ejs");

//middle ware for static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Selecting as city (homePage)
app.get("/", (request, response) => {
  City.find()
    .then((result) =>
      response.render("index", { title: "Home", cities: result })
    )
    .catch((error) => console.log(error));
});

//To  get the weather for a single day
app.get("/weather/:cityId", (request, response) => {
  const { cityId } = request.params;
  WeatherData.findOne({ cityId })
    .sort({ date: -1 })
    .lean()
    .then((currentWeather) => {
      WeatherData.find({ cityId })
        .sort({ date: -1 })
        .limit(7)
        .lean()
        .then((historicalWeather) =>
          response.json({ currentWeather, historicalWeather })
        )
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
});

// Display Data for All Cities Source for lines 60 - 65: chatgpt.com
app.get("/data", (request, response) => {
  City.find()
    .lean()
    .then((cities) => {
      const promises = cities.map((city) =>
        WeatherData.findOne({
          cityId: city._id,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
            $lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
          },
        })
          .sort({ date: -1 })
          .lean()
          .then((currentWeather) => {
            city.currentWeather = currentWeather;
            return city;
          })
          .catch((error) => {
            console.error(
              "Error fetching weather for city ${city.name}:",
              error
            );
            city.weatherData = null;
            return city; //Still return the city even if there was ana error
          })
      );
      return Promise.all(promises);
    })
    .then((citiesWithWeather) =>
      response.render("data", { title: "Data", cities: citiesWithWeather })
    )
    .catch((error) =>
      console.log("Error fetching cities or weather data:", error)
    );
});

// Create Data (Form to Add New City)
app.get("/createData", (request, response) => {
  response.render("createData", { title: "Create Data" });
});

app.post("/createData", (req, res) => {
  const newCity = new City({
    name: req.body.name,
  });

  newCity
    .save()
    .then(() => res.redirect("/"))
    .catch((error) => console.log(error));
});

// Edit Data Page (Editing Data)
app.get("/editData", (request, response) => {
  City.find()
    .then((cities) => {
      response.render("editData", {
        title: "Modify Data",
        cities: cities,
      });
    })
    .catch((error) => console.log(error));
});

// Update weather data
app.put("/weather/:cityId", (request, response) => {
  const { cityId } = request.params;
  const { date, temperature, humidity, windSpeed, conditions } = request.body;

  WeatherData.findOneAndUpdate(
    { cityId, date },
    { temperature, humidity, windSpeed, conditions },
    { new: true, upsert: true }
  )
    .then((updatedWeatherData) => {
      if (!updatedWeatherData) {
        return response.status(404).json({ error: "Weather data not found" });
      }
      response.json(updatedWeatherData);
    })
    .catch((error) => console.log(error));
});

// Route for new weather data form
app.get("/addWeather", (request, response) => {
  City.find()
    .then((cities) =>
      response.render("addWeather", { title: "Add Weather Data", cities })
    )
    .catch((error) => console.log(error));
});

// Route to handle the creation of new weather data
app.post("/weather", (request, response) => {
  const { cityId, date, temperature, humidity, windSpeed, conditions } =
    request.body;

  const newWeatherData = new WeatherData({
    cityId,
    date,
    temperature,
    humidity,
    windSpeed,
    conditions,
  });

  newWeatherData.save()
        .then(() => {
            City.find()
                .then(cities => response.render("addWeather", { 
                    title: "Add Weather Data", 
                    cities,
                    message: "Weather data added successfully!" 
                }))
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
});

// Route to delete specific weather data
// app.delete("/weather/:id", (request, response) => {
//   const { id } = request.params;

//   WeatherData.findByIdAndDelete(id)
//     .then(() => response.json({ redirect: "/data" }))
//     .catch((error) => console.log(error));
// });

// Delete City (and associated weather data)
app.delete('/city/:cityId', (request, response) => {
    const cityId = request.params.cityId;

    //Use `Promise.all` to delete city and weather data atomically source: chatgpt.com 188-191 
    Promise.all([
        City.findByIdAndDelete(cityId),
        WeatherData.deleteMany({ cityId })
    ])
    .then(() => response.json({ redirect: '/data' }))
    .catch(error => {
        console.error("Error deleting city:", error);
    });
});

// 404 Page
app.use((request, response) => {
  response.status(404).render("404", { title: "Error" });
});
