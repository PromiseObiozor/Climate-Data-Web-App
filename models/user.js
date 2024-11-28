// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const bycrypt = require("bycryptjs");

// const userSchema = new mongoose.Schema({
//     username: {type: String, unique: true},
//     password: String,
//     favouriteCities: [{type: mongoose.Schema.Types.ObjectID, ref: "city"}]
// });

// userSchema.pre("save", async function(next) {
//     if(!this.isModified("password"))return next();
//     this.password = await bycrypt.hash(this.password, 10);
//     next();
// });

// module.exports = mongoose.model("User", userSchema);