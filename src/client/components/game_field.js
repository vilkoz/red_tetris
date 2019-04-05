import React from 'react'
import './style.css'

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
            <div className={(el !== 0 ? 'figureElem' : 'fieldElem')}
                 key={colNum.toString() + rowNum.toString()}>&nbsp;</div>
            )
          )}
        </div>
      ))}
    </div>
  )
}

export default GameField
