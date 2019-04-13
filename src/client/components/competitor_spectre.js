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

const CompetitorSpectre = ({ name, field, score }) => {
  if (!field) {
    return <div key={name}/>
  }
  return (
    <div className="spec">
      <span>{name}: {score ? score : '0'} pts</span>
    <div className="specteField">
      {field && field.map((line, rowNum) => (
        <div className="row" key={`row ${rowNum}`}>
          {line.map((el, colNum) => (
            <div className={(el !== 0 ? 'figureElemSpectr field-cell-full-spec' : 'fieldElemSpectr field-cell-empty-spec')}
            key={colNum.toString() + rowNum.toString()}>&nbsp;</div>
            )
          )}
        </div>
      ))}
    </div>
    </div>
  )
}

export default CompetitorSpectre
