import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';

const Modify = () => {
  const {auth, setAuth} = useAuth();
  const [text, setText] = useState('')
  const [groups, setGroups] = useState([])
  const [newGroup, setNewGroup] = useState([])
  const [groupPainting, setGroupPainting] = useState(null)
  const [groupSequenz, setGroupSequenz] = useState('')
  const [media, setMedia] = useState(null)

  const navigate = useNavigate();

  useEffect(()=>{
    fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups')
    .then((response)=>response.json())
    .then((data)=>setGroups(data))
    },[])
  const handleNewGroup = async (event) => {
    event.preventDefault()
    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization : `Bearer ${auth}`
      },
      body:JSON.stringify(newGroup)
    })
    const data = await response.json()
    if (newGroup.group_type==='painting'){
      setGroupPainting(newGroup.name)
    } else {
      setGroupSequenz(newGroup.name)
    }
    
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (text) { formData.append("text", text);}
    if (groupPainting) {formData.append("group_painting", groupPainting);}
    if (groupSequenz) {formData.append("group_sequenz", groupSequenz);}
    if (media) {formData.append("media_file", media);}

    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/entries',{
      method:'POST',
      headers: {
              Authorization : `Bearer ${auth}`
            }, 
      body: formData
    })
    const data = await response.json()
    navigate('/', {replace:true})
  }
  
  return (
    <div>token: {auth}<br/>
    <p>Create a new Entry:</p>
    <form onSubmit={handleSubmit}>
      <label>text: <input type="text" name="text" onChange={e=>setText(e.target.value)}/></label><br/>
      <label>Group Painting:
        <select value={groupPainting} onChange={event=>setGroupPainting(event.target.value)}>
          <option value={null}></option>
          {groups.map((e1) => {
            if (e1.group_type==="painting") {
              return (
                  <option value={e1.name}>{e1.name}</option>
              )
            }}
            )
          }
          <option value="new">new...</option>
         </select>
      </label><br/>
         {groupPainting==='new' &&
      <form>
        <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: "painting"})}/></label>
        <button type='submit' onClick={handleNewGroup}>create</button>
      </form>
    }
      <label>Group Sequenz:
        <select value={groupSequenz} onChange={event=>setGroupSequenz(event.target.value)}>
          <option value={null}></option>
          {groups.map((e1) => {
            if (e1.group_type==="sequenz") {
              return (
                  <option value={e1.name}>{e1.name}</option>
              )
            }}
            )
          }
          <option value="new">new...</option>
         </select>
      </label><br/>
         {groupSequenz==='new' &&
      <form>
        <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: "sequenz"})}/></label>
        <button type='submit' onClick={handleNewGroup}>create</button>
      </form>
    }<br/>
      <input type="file" name="media" onChange={e=>setMedia(e.target.files[0])}/><br/>
      <button type='submit' onClick={handleSubmit}>Submit</button>
    </form>
    GroupPainting = {groupPainting} <br/>
    GroupSequenz = {groupSequenz}
    <p><Link href="/groups">Display groups</Link></p>
    </div>
  )
}

export default Modify