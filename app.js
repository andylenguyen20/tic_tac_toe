const express = require('express');
const gameRouter = require('./router/game_router');
const playerRouter = require('./router/player_router');
const app = express();

const jsonParser = require('body-parser').json;
const logger = require('morgan');
const mongoose = require('mongoose');

mongoose.connect('mongodb://aln20:Blackhawk1506!@ds231242.mlab.com:31242/tic_tac_toe', { useNewUrlParser: true });
//mongoose.connect('mongodb://localhost:27017/QA', { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', err =>{
    console.error('Error while connecting to DB: ' + err.message);
});
db.once('open', () =>{
    console.log('DB connected successfully!');
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    if (req.method === 'Options') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use(logger('dev'));
app.use(jsonParser());
app.use('/games', gameRouter);
app.use('/players', playerRouter);
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log('Web server listening on port' + port);
});
