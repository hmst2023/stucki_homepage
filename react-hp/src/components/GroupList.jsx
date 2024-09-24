import React, { useState } from 'react'
import useAuth from '../hooks/useAuth';

const GroupList = ({items, type, selected, changeSelection}) => { 
    const {auth} = useAuth();
    const [newGroup, setNewGroup] = useState();

    const handleChangeSelection = (e) => {
        changeSelection(e.target.value, e.target.name)
    }

    const handleNewGroup = async (event) => {
        event.preventDefault()
        const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups/',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            Authorization : `Bearer ${auth}`
          },
          body:JSON.stringify(newGroup)
        })
        await response.json();
        changeSelection(newGroup.name, newGroup.group_type);
      }
  return (
    <>
        <label>group {type}:
         <select value={selected} onChange={handleChangeSelection} name={type}>
          <option value={null}></option>
          {items.map((e1, i) => {
              return (
                  <option key={type+i} value={e1.name}>{e1.name}</option>
              )})}
          <option value="new">new...</option>
          </select>
        </label>
          {selected==='new' &&
            <form>
                <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: type})}/></label>
                <button type='submit' onClick={handleNewGroup}>create</button>
            </form>}
        <br/>
    </>
  )
}

export default GroupList