import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';
import useCheckSmallscreen from '../hooks/useCheckSmallscreen';

const Card = ({id, title, text, img, video, timestamp, url}) => {
  let smallscreen = useCheckSmallscreen();
  const dispersion = 100;
  const cardWidth = 100+Math.floor(Math.random() * (smallscreen ? 80 : 350))
  const possibleCardColors = ['#2c57da','#23beae', '#4cdd64', '#afdd4c', '#ddbd4c', '#dd684c', '#dd4c9b', '#bd4cdd']
  const possibleCardColor = possibleCardColors[Math.floor(Math.random() * possibleCardColors.length)] 
  const cardStyle = {
    position: 'relative',
    top: dispersion/2 - Math.random()*dispersion,
    left: dispersion/2 - Math.random()*dispersion,
  }

  function CardWithText(){
    return (
      <div className="Card" style={{...cardStyle, width:cardWidth, height: 'fit-content',backgroundColor : possibleCardColor} }>
        <Link to={"/entries/"+id } state={{ color: possibleCardColor }}>
          {img && <div><img src={img} height="auto" width="auto" alt={title}/></div>}
          <p>
            {video && <video  width="auto" height="auto" playsInline loop muted onMouseOver={event => event.target.play()} onMouseOut={event => event.target.pause()} >
                        <source src={video} type="video/mp4"/>
                      </video>}
          </p>
          <div className="Text">
            <p className='Timestamp'>{timestamp.toLocaleDateString()}</p>
            <p>{text.length>30 ? text.split(' ').slice(0,smallscreen ? 3: 7).join(' ')+'... (+)' : text}</p>
          </div>
      </Link>
    </div>)     
  }
  function MediaOnly(){
    return img ? <Link to={"/entries/"+id} reloadDocument ><img className="Card" src={img} style={cardStyle} height="auto" width={cardWidth} alt={title}/></Link> : <Link to={"/entries/"+id}> <video  width={cardWidth} height="auto" playsInline muted loop onMouseOver={event => event.target.play()} onMouseOut={event => event.target.pause()}>
    <source src={video} type="video/mp4"/>
  </video></Link>
  }


  return (
    
      <>{text ? <CardWithText/> : <MediaOnly/>}</>

  )
}

export default Card