import React from 'react'
import Card from '@/components/Card';
export const getServerSideProps = async() => {
  const res = await fetch('http://127.0.0.1:8000/entries');
  const entries = await res.json();
  return {
    props: {
      entries
    },
  };
}


const index = ({entries}) => {
  return (
    <div>
      <div className='grid grid-cols-3 gap-4'>
        {entries.map((entry) => {
          const {_id, text, img, group_painting, group_sequenz, timestamp} = entry
          return (
            <Card
              key={_id}
              id={_id}
              text={text}
              img={img}
              group_painting={group_painting}
              group_sequenz={group_sequenz}
              timestamp={timestamp}
              />
          );
        }


        )}
      </div>
    </div>
  )
}

export default index