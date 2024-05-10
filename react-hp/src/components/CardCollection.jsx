import React from 'react'
import Card from './Card'

const CardCollection = ({items}) => {
  return (
    <div className='CardCollection'>
    {items!==undefined && items.map((entry, count) => {
      const {_id, title, url, text, video, img, group_painting, group_sequenz, timestamp} = entry
      let dateTime = new Date(timestamp)
      return (
        <Card
          key={'card'+count}
          id={_id}
          title={title}
          text={text}
          img={img}
          url={url}
          video={video}
          group_painting={group_painting}
          group_sequenz={group_sequenz}
          timestamp={dateTime}
          />
      );
    }


    )}
  </div>

  )
}

export default CardCollection