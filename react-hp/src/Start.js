import React from 'react'
import { useState, useEffect, useRef } from 'react'
import Card from './components/Card'

const Start = () => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const getEntries = async () => {
    const timeout = 12000;
    const controller = new AbortController();
    const id2 = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(process.env.REACT_APP_BACKEND_LOCATION+'/entries', {
        signal: controller.signal,
        method:"GET",
      });
      if (!res.ok){
        let errorResponse = await res.json();
        setError(errorResponse["detail"]);
      } else {
        setEntries(await res.json())
        setError([])
      }
    } catch (error) {
      if (error.name==='AbortError'){
        setError(['Possible Timeout'])
    } else {
        setError([error.message])
    }
  };
  clearTimeout(id2);
  }
  useEffect(()=>{
      getEntries();
    },[]);
  
  return (
      <div className='Homepage'>
        {entries!==undefined && entries.map((entry) => {
          const {_id, text, video, img, group_painting, group_sequenz, timestamp} = entry
          return (
            <Card
              key={_id}
              id={_id}
              text={text}
              img={img}
              video={video}
              group_painting={group_painting}
              group_sequenz={group_sequenz}
              timestamp={timestamp}
              />
          );
        }


        )}
      </div>
  )
}

export default Start