import React from 'react'
import { useState } from 'react'



const Test = () => {

    const [test, setTest] = useState('')

    const onChange = (e) => {setTest(e.target.value)}

  return (
    <div style={{backgroundColor: 'white'}} className='BoxContent'>
        <form>
            {test}
            <textarea value={test} onChange={onChange}></textarea>
        </form>
    </div>
  )
}

export default Test