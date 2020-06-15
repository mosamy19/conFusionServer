const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../modals/favorites');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus (200) })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).populate('user').populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({"user":req.user._id})
            .then((favorite) =>{
        if(favorite === null){
            Favorites.create({
                user: req.user._id,
                dishes : []
            })
            .then((favorite)=>{
                for(var index in req.body){
                    favorite.dishes.push(req.body[index]);
                };
                favorite.save()
                .then((favorite)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favorite);
                },(err)=>next(err));
                console.log('A dish has been added to your favorite list');
            },(err)=>next(err))
            .catch((err)=>next(err));
                }
                else{
                    for(var index in req.body){
                        var test = favorite.dishes.indexOf(req.body[index]);
                        console.log("the test value is  "+ test);
                        if(test > -1){
                            var err = new Error('This dish is already in your favorite list');
                            err.status = 401;
                            return next(err);
                        }
                        else{
                            favorite.dishes.push(req.body[index]);
                            favorite.save()
                            .then((favorite)=>{
                                res.statusCode=200;
                                res.setHeader('Content-Type','application/json');
                                console.log('Another Dish has been added');
                                res.json(favorite);
                            },(err)=>next(err));
                        }
                    };
                }
        })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    Favorites.remove({"user":req.user._id})
             .then((resp)=>{
                 res.statusCode=200;
                 res.setHeader('Content-Type','application/json');
                 res.json(resp);
             },(err)=>next(err))
             .catch((err)=>next(err));
 });

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({"user":req.user._id})
    .then((favorite) =>{
if(favorite === null){
            Favorites.create(req.body)
            .then((favorite)=>{
                favorite.user = req.user._id;
                favorite.dishes.push(req.params.dishId);
                favorite.save()
                .then((favorite)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favorite);
                },(err)=>next(err));
                console.log('favorite has been created ',favorite);
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else{
                var test = favorite.dishes.indexOf(req.params.dishId);
                console.log("the test value is  "+ test);
                if(test > -1){
                    var err = new Error('This recipe is already in your favorite list');
                    err.status = 401;
                    return next(err);
                }
                else{
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        console.log('Another Dish has been added');
                        res.json(favorite);
                    },(err)=>next(err));
                }
        }
},(err)=>next(err))
.catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    Favorites.findOne({user: req.user._id})
    .then((favorite)=>{
       if(favorite != null){
        var index = favorite.dishes.indexOf(req.params.dishId);
            if (index > -1) {
                favorite.dishes.splice(index, 1);
            }
            favorite.save()
                .then((favorite)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favorite);
                },(err)=>next(err));
       }
            else{
                err = new Error('Dish ' + req.params.dishId + ' not found');
                res.status = 404;
                return next(err);
            }
        },(err)=>next(err))
            .catch((err)=>next(err));
});
module.exports = favoriteRouter;