import React, {useRef} from 'react'
let didInit = (false)
const Impressum = () => {
  
  if (!didInit){
    console.log('Initializing')
    didInit=true
  }
  return (
<div className='Datenschutz'>
  <h1>stucki.cc</h1>
  <h2>Impressum</h2>
  <p>Hannes Müller-Stucki<br/>
  Hobrechtstr. 58<br/>
  12047 Berlin<br/>Deutschland<br/>
  E-Mail: mailer@stucki.cc</p>
  <p>Verantwortlich gemäß §18 MStV:<br/>
  Hannes Müller-Stucki<br/>
  Hobrechtstr. 58<br/>
  12047 Berlin<br/></p></div>)
}

export default Impressum