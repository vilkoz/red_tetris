import React from 'react'
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import ping from '../actions/server'

const App = ({ message, sendPing }) => {
	  return (
		  <div>
			<h1>Kos pidoras</h1>
				<button onClick={sendPing}>PUP</button>
			<span>{message}</span>
		  </div>
	  )
}

const mapStateToProps = (state, ownProps) => {
	console.log('state:', state)
	console.log('ownProps:', ownProps)
  return {
    message: state.message,
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
	console.log('dispatch:', dispatch)
	console.log('ownProps:', ownProps)
	return {
		sendPing: () => dispatch({type: 'server/ping', message: 'test'}),
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(App)


