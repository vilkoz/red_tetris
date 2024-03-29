import React from 'react'
import { StyleSheet, css } from 'aphrodite';
import _ from 'lodash';

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
    <div className='spec'>
      <span>{_.truncate((name), {
        'length': 14,
        'separator': ' '
      })}: {score ? score : '0'} pts</span>
      <div className='specteField'>
        {field && field.map((line, rowNum) => (
          <div className='row' key={`row ${rowNum}`}>
            {line.map((el, colNum) => (
              <div className={`figureElemSpectr field-cell-${el !== 0 ? 'full' : 'empty'}-spec ${el !== 0 ? 'bg-red' :
                'bg-gray' }`} key={colNum.toString() + rowNum.toString()}>&nbsp;</div>
            )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompetitorSpectre
