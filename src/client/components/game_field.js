import React from 'react'
import './style.css'

const figureColors = {
  1: 'bg-red',
  2: 'bg-blue',
  3: 'bg-green',
  4: 'bg-yellow',
  5: 'bg-aqua',
}

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
          {
            line.map((el, colNum) => (
              <div className={`fieldElem ${figureColors[el]}`}
                key={colNum.toString() + rowNum.toString()}>&nbsp;</div>
            ))
          }
        </div>
      ))}
    </div>
  )
}

export default GameField
