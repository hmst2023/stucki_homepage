import React from 'react'
import { useState } from 'react'

const CheckboxList = ({originalValue=[], sendChangedValues}) => {
  console.log(originalValue)
  var kvMaterials =  {oil:false, canvas: false, watercolor:false, tempera:false, paper:false, electronics:false, code:false}

    var [labelsChecked, setLabelsChecked] = useState(kvMaterials)

    var handleChange = (e)=> {
        sendChangedValues({...labelsChecked, [e.target.name]: e.target.checked})
        setLabelsChecked({...labelsChecked, [e.target.name]: e.target.checked})
    }
  return (
    <>
                {
                    labelsChecked && Object.entries(labelsChecked).map(([key, value], count)=>{return  <label key={'checkbox'+count}><input name={key} type='checkbox' checked={value} onChange={handleChange}/>{key}</label>})
                }          
    </>
  )
}

export default CheckboxList