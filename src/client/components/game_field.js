import React from 'react'
import { StyleSheet, css } from 'aphrodite'

const styles = StyleSheet.create({
  fieldElem: {
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
  figureElem: {
    backgroundColor: 'red',
    display: 'inline-block',
    fontFamily: 'monospaced',
  },
})

const GameField = ({ field, figure }) => {
  if (!field) {
    return <div/>
  }
  const placeFigure = (field, figure) => (
    field.map((line, y) => (
      line.map((el, x) => {
        if (x >= figure.x && x - figure.x < figure.figure[0].length &&
          y >= figure.y && y - figure.y < figure.figure.length &&
          figure.figure[y - figure.y][x - figure.x] !== 0) {
          return figure.figure[y - figure.y][x - figure.x]
        }
        return el
      })
    ))
  )
  const fieldWithFigure = figure ? placeFigure(field, figure) : field
  return (
    <div>
      {fieldWithFigure.map((line, rowNum) => (
        <div key={`row ${rowNum}`}>
          {line.map((el, colNum) => (
            <div className={css(el !== 0 ? styles.figureElem : styles.fieldElem)} key={colNum.toString() + rowNum.toString()}>{el}</div>)
          )}
        </div>
      ))}
    </div>
  )
}

export default GameField
