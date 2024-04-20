import React from 'react'
import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react';

const Card = ({id, text, img, video, timestamp}) => {
  const dispersion = 150;
  const possibleCardColors = ['#2c57da','#23beae', '#4cdd64', '#afdd4c', '#ddbd4c', '#dd684c', '#dd4c9b', '#bd4cdd']
  const cardStyle = {
    position: 'relative',
    top: dispersion/2 - Math.random()*dispersion,
    left: dispersion/2 - Math.random()*dispersion,
  }

  function CardWithText(){
    return (
      <div className="Card" style={{...cardStyle, backgroundColor : possibleCardColors[Math.floor(Math.random() * possibleCardColors.length)] } }>
      {img && <div><img src={img} width="auto" height={150+ Math.random()*150}/></div>}
      <p>{text}</p>
      <p>{timestamp}</p>
      <p>{video && <video  width="auto" height={150+ Math.random()*150} autoplay loop muted onMouseOver={event => event.target.play()} onMouseOut={event => event.target.pause()} >
                      <source src={video} type="video/mp4"/>
                    </video>}
      </p>
    </div>)     
  }
  function MediaOnly(){
    return img ? <img className="Card" src={img} style={cardStyle} width="auto" height={250+ Math.random()*150}/> : <video  width="auto" height={250+ Math.random()*150} autoplay muted loop onMouseOver={event => event.target.play()} onMouseOut={event => event.target.pause()} >
    <source src={video} type="video/mp4"/>
  </video>
  }
  return (
    <Link to={"entries/"+id}>
      {text ? <CardWithText/> : <MediaOnly/>}
    </Link>
  )
}

export default Card