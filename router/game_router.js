const express = require('express');
const router = express.Router();
const Game = require('../model').Game;
const Player = require('../model').Player;

router.param('gameID', (req, res, next, id) => {
    Game.findById(id, (err, doc) => {
        if (err) return next(err);
        if (!doc) {
            err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        req.game = doc;
        return next();
    });
});

// get all games
router.get('/', (req, res, next) => {
    Game.find({}).sort({ createdAt: -1 }).exec((err, games) => {
        if (err) return next(err);
        res.json(games);
    });
});

router.get('/:gameID', (req, res) => {
    res.json(req.game);
});

router.post('/:uID', (req, res, next) => {
    createGame(req, res, next);
});

function createGame(req, res, next){
    const game = new Game(req.body);
    uID = req.params.uID;
    game.created_by = uID;
    game.save((err, game) => {
        if (err) return next(err);
        res.status(201);
        res.json(game);
    });
}

router.post('/:gameID/turns', (req, res, next) => {
    req.game.turns.push(req.body);
    req.game.save((err, game) => {
        if (err) return next(err);
        res.status(201);
        res.json(game);
    });
});

// join an open game and return the game we just joined in the result
router.post('/join/:uID/:opID?', (req, res, next) => {
    uID = req.params.uID;
    opID = req.params.opID;
    if(opID){
        Game.findOne({created_by: opID}).exec((err, game) => {
            if (err) return next(err);
            if (!game) {
                err = new Error('Could not find game started by player ' + opID);
                err.status = 404;
                return next(err);
            }
            game.opponent = uID;
            game.save((err, game) =>{
                if (err) return next(err);
                res.status(201);
                res.json(game);
            })
        });
    }else{
        Game.find({}).sort({ createdAt: -1 }).exec((err, games) => {
            if (err) return next(err);
            errSaving = false;
            errNoGamesFound = true;
            var self = this;
            var noOpenGames = true;
            games.forEach(function(game){
                if (!game.opponent){ // if game is open, then join it
                    console.log("no opponent")
                    game.opponent = uID;
                    game.save((err, game) =>{
                        if (err) self.return(next(err))
                        res.json(game);
                    });
                    noOpenGames = false;
                }
            });
            if(noOpenGames){
                createGame(req, res, next);
            }
        });
    }
});

// put the result of the game
router.post('/:gameID/results/:uID/:action', (req, res, next) =>{
    action = req.params.action;
    uID = req.params.uID;
    var oID = null;
    if(req.game.created_by === uID){
        oID = req.game.opponent;
    }else if(req.game.opponent === uID){
        oID = req.game.created_by;
    }else{
        const err = new Error("UID " + uID + " is not a user in this game");
        err.status = 404;
        return next(err);
    }
    if (action === "lose") {
        req.game.result = {
            winner: oID,
            loser: uID
        }
        req.game.save((err, game) =>{
            if(err) return next(err);
            res.json(game);
        });
        updatePlayerRecordLose(uID, next);
    }else if(action === "win"){
        req.game.result = {
            winner: uID,
            loser: oID
        }
        req.game.save((err, game) =>{
            if(err) return next(err);
            res.json(game);
        });
        updatePlayerRecordWin(uID, next);
    }else if (action === "draw"){
        req.game.result = {
            draw: true
        }
        req.game.save((err, game) =>{
            if(err) return next(err);
            res.json(game);
        });
        updatePlayerRecordDraw(uID, next);
    }else{
        const err = new Error("Not possible to perform action: " + action);
        err.status = 404;
        return next(err);
    }
});

function updatePlayerRecordWin(winnerUID, next){
    Player.findById(winnerUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementWin(player)
    });
}

function updatePlayerRecordLose(loserUID, next){
    Player.findById(loserUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementLoss(player)
    });
}

function updatePlayerRecordDraw(drawerUID, next){
    Player.findById(drawerUID, (err, player) => {
        if (err) return next(err);
        if (!player) {
            err = new Error('Player not found');
            err.status = 404;
            return next(err);
        }
        incrementDraw(player);
    });
}

function incrementDraw(player){
    player.draws += 1;
    player.save((err, game) =>{
        if(err) return next(err);
    });
}

function incrementLoss(player){
    player.losses += 1;
    player.save((err, game) =>{
        if(err) return next(err);
    });
}

function incrementWin(player){
    player.wins += 1;
    player.save((err, player) =>{
        if(err) return next(err);
    });
}
// delete an existing game
router.delete('/:gameID', (req, res, next) => {
    req.game.remove((err,game) => {
        if (err) return next(err);
        res.json(game);
    });
});

module.exports = router;