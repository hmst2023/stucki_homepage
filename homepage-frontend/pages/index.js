import React from 'react'
import Card from '@/components/Card';
export const getServerSideProps = async() => {
  const res = await fetch(process.env.FASTAPI_BACKEND + '/entries');
  const entries = await res.json();
  return {
    props: {
      entries
    },
  };
}


const index = ({entries}) => {
  return (
    <div class="bg-cover bg-center" style={{backgroundImage: `url(https://res.cloudinary.com/***REMOVED***/image/upload/v1681814485/lpd6jgnevlqve1iwbhc1.jpg)`, height: '100vh'}}>
      <div className='grid grid-cols-3 gap-4 '>
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