import React from 'react'
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next'
import { Input } from 'postcss';
import { data } from 'autoprefixer';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const getServerSideProps = async({req, res}) => {
  const jwt = getCookie("jwt", {req,res});

  return {props: {jwt}};
}

const modify = ({jwt}) => {
  const [text, setText] = useState('')
  const [groups, setGroups] = useState([])
  const [newGroup, setNewGroup] = useState([])
  const [groupPainting, setGroupPainting] = useState(null)
  const [groupSequenz, setGroupSequenz] = useState('')
  const [img, setImg] = useState(null)
  
  const router = useRouter();

  useEffect(()=>{
    fetch(process.env.REACT_APP_BACKEND_URL + 'groups')
    .then((response)=>response.json())
    .then((data)=>setGroups(data))
    },[])


  const handleNewGroup = async (event) => {
    event.preventDefault()
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + 'groups',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
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
    if (img) {formData.append("img", img);}


    const response = await fetch(process.env.FASTAPI_BACKEND + '/entries',{
      method:'POST',
      body: formData
    })
    const data = await response.json()
    router.push('/')
  }

  return (
    <div>token: {jwt}<br/>
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
      <input type="file" name="img" onChange={e=>setImg(e.target.files[0])}/><br/>
      <button type='submit' onClick={handleSubmit}>Submit</button>
    </form>
    GroupPainting = {groupPainting} <br/>
    GroupSequenz = {groupSequenz}
    <p><Link href="/groups">Display groups</Link></p>
    </div>
  )
}

export default modify