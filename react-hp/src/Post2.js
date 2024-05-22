import React,{useState, useEffect} from 'react'
import UploadWidget from './components/uploadWidget';
import useAuth from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Post2 = () => {
  const {auth} = useAuth();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState([]);
  const [groupPainting, setGroupPainting] = useState('');
  const [groupSequenz, setGroupSequenz] = useState('');
  const [media, setMedia] = useState();

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/entries/2',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization : `Bearer ${auth}`
      },
      body:JSON.stringify({...title && {title: title}, ...text && {text: text}, ...url && {url:url}, ... groupPainting && {group_painting: groupPainting}, ... groupSequenz && {group_sequenz: groupSequenz}, ...media && {media_file: media}})
    })
    const data = await response.json()
    navigate('/', {replace:true})
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
      setGroupPainting(newGroup.name)
    } else {
      setGroupSequenz(newGroup.name)
    }
    
  }




  const handleDeleteMedia = async (e)=>{
    e.preventDefault()
    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/media/'+ media.public_id+'/'+media.resource_type ,{
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        Authorization : `Bearer ${auth}`
      }
    })
    if (response.ok){
      setMedia(null)
    }

  }
  const handleEnteredUrl = (url)=>{
    setMedia(url);
  }
  useEffect(()=>{
    fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups/')
    .then((response)=>response.json())
    .then((data)=>setGroups(data))
    },[groupPainting, groupSequenz])



  return (
    <div className='Postform'>
      {!media && <UploadWidget receivedUrl={handleEnteredUrl}/>}
      <form onSubmit={handleSubmit}>
      {media && 
      <>
        <label>Media:</label>{'...' + media.secure_url.slice(40)}<br/>
        <img src={media.thumbnail_url}/><br/>
        <button onClick={handleDeleteMedia}>delete media</button><br/>
      </>}
      <label>title: <input type='text' name='title' onChange={e=>setTitle(e.target.value)}/></label><br/>
      <label>text: <input type="text" name="text" onChange={e=>setText(e.target.value)}/></label><br/>
      <label>url: <input type="text" name="url" onChange={e=>setUrl(e.target.value)}/></label><br/>
      <label>Group Painting:
        <select value={groupPainting} onChange={event=>setGroupPainting(event.target.value)}>
          <option value={null}></option>
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
         {groupPainting==='new' &&
      <form>
        <label>New Group<input type="text" name="name" onChange={e=>setNewGroup({[e.target.name]: e.target.value, group_type: "painting"})}/></label>
        <button type='submit' onClick={handleNewGroup}>create</button>
      </form>
    }
      <label>Group Sequenz:
        <select value={groupSequenz} onChange={event=>setGroupSequenz(event.target.value)}>
          <option value={null}></option>
          {groups.map((e1, i) => {
            if (e1.group_type==="sequenz") {
              return (
                  <option key={'seq'+i} value={e1.name}>{e1.name}</option>
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
          <button type='submit' onClick={handleSubmit}>Submit</button>


      </form>


    </div>
  )
}

export default Post2