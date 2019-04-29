# Red Tetris Project

The project was created to gain insight into full stack javascript programming, the repository [red-tetris-boilerplate](https://github.com/redpelicans/red_tetris_boilerplate) was used as entry point.

#### Application architecture

![architecture](https://i.imgur.com/R4SmZ2S.jpg)

## Screenshots

#### Lobby
![Lobby](https://i.imgur.com/nCudFbJ.png)
#### Game Lobby
![Game Lobby](https://i.imgur.com/Yp9VHvs.jpg)
#### Game Lobby with multiple players
![Game Lobby with multiple players](https://i.imgur.com/gD374vM.jpg)
#### Game single player
![Game single player](https://i.imgur.com/kXGMyRJ.jpg)
#### Game multi player
![Game multi player](https://i.imgur.com/ZQeU8No.jpg)
#### Game over
![Game over](https://i.imgur.com/K0gKcyO.jpg)

## Install

Install [node](https://nodejs.org/en/) first. After that:

```
$ npm install
```

Edit `params.js` for your needs.


## Development Mode

#### Launch Server

```
$ npm run  srv-dev
```

#### Launch Client

```
$ npm run client-dev
```


Point your browser to `http://0.0.0.0:8080/` it will load client side application.

#### Test

Stop server, and run:
```
$ npm run test
```

Tests are installed under `test` folder.

#### Coverage

```
npm run coverage
```

Check results …. of this command, and launch your browser to `./coverage/lcov-report/index.html`


## Production Mode

It’s not a production recipe to run your Tetris over billions of players, but just 2 commands to run it without live reload.

```
$ npm run build
$ npm run start
```
