import React from 'react'
import { Connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import Lobby from '../components/lobby'
import Game from '../components/game'
import GameLobby from '../components/game_lobby'

const App = () => (
  <Switch>
    <Route exact path='/' component={Lobby} />
    <Route exact path='/game_lobby/:room' component={GameLobby} />
    <Route exact path='/:room[:player_name]' component={Game} />
  </Switch>
)

export default App;
