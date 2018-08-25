const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schemas
const TurnSchema = new Schema({
    taken_by_player: String,
    position: {
        row: { type: Number},
        col: { type: Number}
    },
    created_at: { type: Date, default: Date.now }
});
const GameSchema = new Schema({
    created_by: String,
    opponent: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    turns: [TurnSchema]
});
const PlayerSchema = new Schema({
    display_name : String,
    wins: { type: Number, default: 0},
    losses: { type: Number, default: 0},
    draws: { type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
});
const sortTurns = (a, b) => {
    return b.created_at.getTime() - a.created_at.getTime();
};

GameSchema.pre('save', function (next) {
    this.turns.sort(sortTurns);
    this.updated_at = new Date();
    next();
});

const Game = mongoose.model('Game', GameSchema);
const Player = mongoose.model('Player', PlayerSchema);
const Turn = mongoose.model('Turn', TurnSchema);

module.exports.Game = Game;
module.exports.Player = Player;
module.exports.Turn = Turn;