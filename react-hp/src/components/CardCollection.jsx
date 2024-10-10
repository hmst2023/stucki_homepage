import React from 'react'
import Card from './Card'

const CardCollection = ({items}) => {
  return (
    <div className='CardCollection'>
    {items!==undefined && items.map((entry, count) => {
      const {_id, text, video, img, timestamp} = entry
      let dateTime = new Date(timestamp)
      return (
        <Card
          key={'card'+count}
          id={_id}
          text={text}
          img={img}
          video={video}
          timestamp={dateTime}
          />
      );
    }


    )}
  </div>

  )
}

export default CardCollection