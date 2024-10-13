import React from 'react'
import { useState } from 'react'
import CheckboxList from './components/CheckboxList'

const Canvas = () => {
  var [labelsChecked, setLabelsChecked] = useState({'hello':false, 'ploo':false,'trop':false,'klopp':false})

  const receiveChangedValues = (e)=>{
    setLabelsChecked({...labelsChecked, [e.target.name]: e.target.checked});
  }
  return (
    <div className='Postform'>
      <canvas id="myCanvas" width="500px" height="500px">
        Sorry, your browser doesn't support canvas technology.
      </canvas> 
      hello
      <CheckboxList originalValue={labelsChecked} sendChangedValues={receiveChangedValues} />
      <button onClick={()=>console.log(labelsChecked)}>test</button>
    </div>
  )
}

export default Canvas