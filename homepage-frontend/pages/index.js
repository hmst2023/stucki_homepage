import React from 'react'
export const getServerSideProps = async() => {
  const res = await fetch('http://127.0.0.1:8000');
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
      index:
      {entries.map((entry) => {
        return (
          <div>{entry.text} {entry.url}</div>
        );
      }


      )}
    </div>
  )
}

export default index