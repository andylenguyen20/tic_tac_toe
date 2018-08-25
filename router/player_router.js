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

// put the result of the game
router.post('/addResult/:uID/:action', (req, res, next) =>{
    action = req.params.action;
    uID = req.params.uID;
    if (action === "lose") {
        updatePlayerRecordLose(uID, next, res);
    }else if(action === "win"){
        updatePlayerRecordWin(uID, next, res);
    }else if (action === "draw"){
        updatePlayerRecordDraw(uID, next, res);
    }else{
        const err = new Error("Not possible to perform action: " + action);
        err.status = 404;
        return next(err);
    }
});

function updatePlayerRecordWin(winnerUID, next, res){
    Player.findById(winnerUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementWin(player, res)
    });
}

function updatePlayerRecordLose(loserUID, next, res){
    Player.findById(loserUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementLoss(player, res)
    });
}

function updatePlayerRecordDraw(drawerUID, next, res){
    Player.findById(drawerUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementDraw(player, res);
    });
}

function incrementDraw(player, res){
    player.draws += 1;
    player.save((err, player) =>{
        if(err) return next(err);
        res.json(player);
    });
}

function incrementLoss(player, res){
    player.losses += 1;
    player.save((err, player) =>{
        if(err) return next(err);
        res.json(player);
    });
}

function incrementWin(player, res){
    player.wins += 1;
    player.save((err, player) =>{
        if(err) return next(err);
        res.json(player);
    });
}

module.exports = router;