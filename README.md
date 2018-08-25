# tic_tac_toe

This is the game server for my other repository, tic_tac_toe_android, which is a client side android application that makes requests to this server to play Tic Tac Toe.

This game server is a REST api built using Express.js and Node.js using express router. This game server communicates with a MongoDB database. Below are the routes:

Game routes:

*GET /games
*GET /games/:gameID
*POST /games/:uID
*POST /games/join/:userID/:opID?
*POST /games/:gameID/turns
*DELETE /games/:gameID

Player routes:

*GET /players
*GET /players/displayName/:displayName
*GET /players/id/:id
*POST /players/:displayName
*POST /players/addResult/:uID/:action

Requests can be made to https://murmuring-escarpment-67851.herokuapp.com/
