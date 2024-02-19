import React from 'react'
import Link from 'next/link';

export const getServerSideProps = async() => {
    const res = await fetch(process.env.FASTAPI_BACKEND + '/groups');
    const groups = await res.json();
    return {
      props: {
        groups
      },
    };
}  


const index = ({groups}) => {
    console.log(groups)
  return (
    <div>
        {groups.map((group)=><p><Link href={"/groups/"+group._id} >{group.name}{group.group_type}</Link></p>
        )}
    </div>
  )
}

export default index