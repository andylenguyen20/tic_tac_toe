const express = require('express');
const router = express.Router();
const Player = require('../model').Player;

// get all players
router.get('/', (req, res, next) => {
    Player.find({}).sort({ createdAt: -1 }).exec((err, players) => {
        if (err) return next(err);
        res.json(players);
    });
});

// find a player by display name
router.get('/displayName/:displayName', (req, res, next) => {
    var displayName = req.params.displayName;
    Player.findOne({display_name: displayName}).exec((err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error("Player with display name " + displayName + " not found");
            err.status = 404;
            return next(err);
        }
        res.json(player)
    });
});

// find a player by uid
router.get('/id/:id', (req, res, next) => {
    var id = req.params.id;
    Player.findById(id).exec((err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error("Player with display name " + displayName + " not found");
            err.status = 404;
            return next(err);
        }
        res.json(player)
    });
});


// create a new player
router.post('/:displayName', (req, res, next) => {
    const player = new Player(req.body);
    var displayName = req.params.displayName;
    // ensure that this new player's username is unique
    Player.find({display_name: displayName}).exec((err, players) => {
        console.log(players);
        if (err || players.length != 0) {
            err = new Error('Player with same display name already exists!');
            err.status = 400;
            return next(err);
        }else{
            player.display_name = displayName;
            player.save((err, player) => {
                if (err) return next(err);
                res.status(201);
                res.json(player);
            });
        }
    });
});

module.exports = router;