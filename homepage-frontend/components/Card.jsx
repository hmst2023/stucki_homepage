import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Card = ({id, text, img, group_painting, group_sequenz, timestamp}) => {
  return (
    <Link href={"entries/"+id}>
        <div className='bg-red-300 rounded p-5 my-5'>
            {img && <div><Image src={img} width={100} height={300}/></div>}
            <p>{text}</p>
            <p>{timestamp}</p>
         </div>
    </Link>
  )
}

export default Card