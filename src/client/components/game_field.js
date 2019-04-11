import React from 'react'
import './style.css'

const figureColors = {
  0: 'bg-gray field-cell-empty',
  1: 'bg-red field-cell-full',
  2: 'bg-blue field-cell-full',
  3: 'bg-green field-cell-full',
  4: 'bg-yellow field-cell-full',
  5: 'bg-aqua field-cell-full',
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
