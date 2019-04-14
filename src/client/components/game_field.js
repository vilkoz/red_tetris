import React from 'react'
import { checkCollision } from '../reducers/alert'

const figureColors = {
  0: 'bg-gray field-cell-empty',
  1: 'bg-red field-cell-full',
  2: 'bg-blue field-cell-full',
  3: 'bg-green field-cell-full',
  4: 'bg-yellow field-cell-full',
  5: 'bg-aqua field-cell-full',
  6: 'bg-gray field-cell-full',
}

const getFigureShadow = (field, figure) => {
  const resFigure = { ...figure, figure: figure.figure.map(row => row.map(el => (el !== 0 ? 6 : 0))) }
  if (figure.y === 0 && !checkCollision(figure, field)) {
    return figure
  }
  while (checkCollision(resFigure, field)) {
    resFigure.y = resFigure.y + 1
  }
  resFigure.y = resFigure.y - 1
  return resFigure
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
  const fieldWithFigure = figure ? placeFigure(placeFigure(field, getFigureShadow(field, figure)), figure) : field
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
