import React from 'react'
import Card from '@/components/Card';
export const getServerSideProps = async() => {
  const res = await fetch(process.env.NEXT_PUBLIC_FASTAPI_BACKEND + '/entries');
  const entries = await res.json();
  return {
    props: {
      entries
    },
  };
}


const index = ({entries}) => {
  return (
    <div className="bg-cover bg-center p-5" style={{backgroundImage: `url(https://res.cloudinary.com/***REMOVED***/image/upload/v1708462222/b4yhuszmwjw6h041i5q0.jpg)`, height: '100vh'}}>
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