const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    dishID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
});


const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes:[dishSchema]
},
    {
        timestamps: true
    })

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;