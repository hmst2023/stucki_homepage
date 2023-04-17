import React from 'react'

const handleForm = async (event)=> {
    event.preventDefault();
    console.log(event);
} 


const test = () => {
  return (
    <div>
        <form onSubmit={handleForm}>
            <button>test </button>
        </form>

    </div>
  )
}

export default test