import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import './Entry.css'
import CardCollection from './components/CardCollection';

const Entry = () => {
  const {auth} = useAuth();
  const [entry, setEntry] = useState({});
  const [newEntry, setNewEntry] = useState({});
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState([]);

  const {id} = useParams();

  let navigate = useNavigate();
  let { state } = useLocation();
  const possibleCardColors = ['#2c57da','#23beae', '#4cdd64', '#afdd4c', '#ddbd4c', '#dd684c', '#dd4c9b', '#bd4cdd']
  const possibleCardColor = useRef(possibleCardColors[Math.floor(Math.random() * possibleCardColors.length)])

  const onChange = (e) => {
    setNewEntry({...newEntry, [e.target.name]: e.target.value})
  }
  const getEntry = async()=>{
    const timeout = 8000;
    const controller = new AbortController();
    const id2 = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(process.env.REACT_APP_BACKEND_LOCATION + "/entries/"+id, {
          signal: controller.signal,
          method:"GET",
        })
        const data = await res.json()
        if (!res.ok){
          let errArray = data.detail.map(e1=>{return `${e1.loc[1]}- ${e1.msg}`});
          setError(errArray);
        } else {
          setError([]);
          setEntry(data);
        }
      } catch (error) {
        if (error.name==='AbortError'){
          setError(['Possible Timeout'])
      } else {
          setError([error.message])
      }
    };
    clearTimeout(id2);
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
    const data = await response.json()
    if (newGroup.group_type==='painting'){
      setNewEntry({...newEntry, groupPainting: newGroup.name})
    } else {
      setNewEntry({...newEntry, groupSequenz: newGroup.name})
    }
    
  }
  

  function handleDelete () {
    fetch(process.env.REACT_APP_BACKEND_LOCATION + `/entries/${entry._id}`,{
        method: "Delete",
        headers: {
          Authorization : `Bearer ${auth}`
        },
    })
    .then(response=>console.log(response))
    .then(navigate("/", {replace:true}))
  }

  const handleUpdate = async(e)=>{
    if (e.target.form.checkValidity()){
      e.preventDefault()
      const formData = new FormData();
      if (newEntry.title) { formData.append("title", newEntry.title);}
      if (newEntry.text) { formData.append("text", newEntry.text);}
      if (newEntry.url) { formData.append("url", newEntry.url);}
      if (newEntry.groupPainting) {formData.append("group_painting", newEntry.groupPainting);}
      if (newEntry.groupSequenz) {formData.append("group_sequenz", newEntry.groupSequenz);}
      if (newEntry.media) {formData.append("media_file", newEntry.media);}
      const timeout = 8000;
      const controller = new AbortController();
      const id2 = setTimeout(() => controller.abort(), timeout);
      try {
        console.log(typeof(formData.get("text")))
      const res = await fetch(process.env.REACT_APP_BACKEND_LOCATION + "/entries/"+id, {
        method:"PATCH",
        signal:controller.signal,
        headers: {
            Authorization : `Bearer ${auth}`,
          },
        body: formData
        })
      navigate("/")
      } catch (error) {
        if (error.name==='AbortError'){
          setError(['Possible Timeout'])
      } else {
          setError([error.message])
      }
      }
    } 
    }



  useEffect(()=>{
    getEntry();
  },[state])

  
  var TimestampAndTitle =  () => {
    var temp = new Date(entry.timestamp)
    return <div className='TimestampAndTitle'>{(entry.title && entry.title + ', ')} {temp.toLocaleDateString()}</div>
  }
  
  useEffect(()=>{
    if (auth!==''){
    fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups/')
    .then((response)=>response.json())
    .then((data)=>setGroups(data))
    }
  },[auth, newEntry.groupPainting, newEntry.groupSequenz])

  
  return (
    <>
    <div style={{backgroundColor: state ? state.color : possibleCardColor.current}}>
    <div className='BoxContent'>
        {entry.img && <img src={entry.img} width={auth ? '25%':'auto'}/>}
        {entry.video &&  <video  width={auth ? "25%":"auto"} autoPlay playsInline loop muted onMouseOver={event => event.target.play()} onMouseOut={event => event.target.pause()} >
                          <source src={entry.video} type="video/mp4"/>
                        </video>}
        <div className='Text'>
          <TimestampAndTitle/>
          {entry.text &&<p>{entry.text}</p>}
          {entry.url && <Link to={entry.url}>{entry.url}</Link>}
          {auth && <>
                    <form>
                      <input type='file' name="media" onChange={e=>setNewEntry({...newEntry, media:e.target.files[0]})}/>
                    <p>Media:{entry.img} {entry.video} </p>
                    <button type="button" name="media" onClick={() =>{setNewEntry({...newEntry, media: "None"})}}>Remove Media</button>
            <p>Title: {entry.title}</p><input type="text" name="title" rows="4" cols="80" value={newEntry.title ? newEntry.title : entry.title} onChange={onChange}/>
            <p>Text: {entry.text}</p><textarea name="text" rows="4" cols="80" value={newEntry.text ? newEntry.text : entry.text} onChange={onChange}/>
            <p>URL: {entry.url}<input type='text' name="url" value={newEntry.url ? newEntry.url :entry.url} onChange={onChange}/></p>
            <label>Group Painting: {entry.group_painting}
        <select value={newEntry.groupPainting} onChange={event=>setNewEntry({...newEntry, groupPainting: event.target.value})}>
        <option value={null}></option>
          <option value="None">None</option>
          {groups.map((e1, i) => {
            if (e1.group_type==="painting") {
              return (
                  <option key={'paint'+i} value={e1.name}>{e1.name}</option>
              )
            }}
            )
          }
          <option value="new">new...</option>
         </select>
      </label><br/>
      {newEntry.groupPainting==='new' &&
      <form>
        <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: "painting"})}/></label>
        <button type='submit' onClick={handleNewGroup}>create</button>
      </form>
    }
                        <label>Group Sequenz: {entry.group_sequenz}
        <select value={newEntry.groupSequenz} onChange={event=>setNewEntry({...newEntry, groupSequenz: event.target.value})}>
        <option value={null}></option>
          <option value="None">None</option>
          {groups.map((e1, i) => {
            if (e1.group_type==="sequenz") {
              return (
                  <option key={'sequenz'+i} value={e1.name}>{e1.name}</option>
              )
            }}
            )
          }
          <option value="new">new...</option>
         </select>
      </label><br/>
      {newEntry.groupSequenz==='new' &&
      <form>
        <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: "sequenz"})}/></label>
        <button type='submit' onClick={handleNewGroup}>create</button>
      </form>
    }

            <button type="submit" onClick={handleUpdate}>update entry</button>
            &nbsp;&nbsp;
            <button onClick={handleDelete}>Delete</button>
                    </form>
                    <p>Use "None" to remove items</p>
                    <p>{error} {JSON.stringify(newEntry)}</p>
          </>}
        </div>
    </div>
  </div>

  {entry.group_painting_members && entry.group_painting_members.length>0 && <div className='GroupExplanation' style={{color: state ? state.color : possibleCardColor.current}}>occurences:</div>}
  {entry.group_painting_members && entry.group_painting_members.length>0 && <CardCollection items={entry.group_painting_members}></CardCollection>}

  {entry.group_sequenz_members && entry.group_sequenz_members.length>0 && <div className='GroupExplanation' style={{color: state ? state.color : possibleCardColor.current}}>belongs to:</div>}
  {entry.group_sequenz_members && entry.group_sequenz_members.length>0 &&<CardCollection items={entry.group_sequenz_members}></CardCollection>}

</>


  )

  }
export default Entry