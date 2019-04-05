import React from 'react'
import './style.css'
import { StyleSheet, css } from 'aphrodite';

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

const CompetitorSpectre = ({ name, field }) => {
  if (!field) {
    return <div key={name}/>
  }
  return (
    <div>
      {field.map((line, rowNum) => (
        <div key={`row ${rowNum}`}>
          {line.map((el, colNum) => (
            <div className={css(el !== 0 ? figureElem : fieldElem)} key={colNum.toString() + rowNum.toString()}>{el}</div>)
          )}
        </div>
      ))}
    </div>
  )
}

export default CompetitorSpectre
