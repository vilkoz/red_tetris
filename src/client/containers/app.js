import React from 'react'
import { Connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import Lobby from '../components/lobby'
import Game from '../components/game'

const App = () => (
  <Switch>
    <Route exact path="/" component={Lobby} />
    <Route exact path="/:room" component={Game} />
  </Switch>
)

export default App;
