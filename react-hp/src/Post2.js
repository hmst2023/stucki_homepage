import React,{useState, useEffect} from 'react'
import UploadWidget from './components/uploadWidget';
import useAuth from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GroupList from './components/GroupList';

const Post2 = () => {
  const {auth} = useAuth();
  const [newEntry, setNewEntry] = useState({});
  const [groups, setGroups] = useState([]);

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/entries/2',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Authorization : `Bearer ${auth}`
      },
      body:JSON.stringify(newEntry)
    })
    await response.json()
    navigate('/', {replace:true})
  }

  const handleDeleteMedia = async (e)=>{
    e.preventDefault()
    const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + '/media/'+ newEntry.media.public_id+'/'+newEntry.media.resource_type ,{
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        Authorization : `Bearer ${auth}`
      }
    })
    if (response.ok){
      setNewEntry({...newEntry, media: null})
    }

  }
  const handleEnteredUrl = (url)=>{
    setNewEntry({...newEntry, media: url});
  }
  
  const handleSelectionChange = (val, type)=>{
    if (type==='sequenz'){
      setNewEntry({...newEntry, groupSequenz: val})
    } else {
      setNewEntry({...newEntry, groupPainting: val})
    }
  }
  const handleChangedValue = (e)=>{
    setNewEntry({...newEntry, [e.target.name]:e.target.value})
  }
  
  useEffect(()=>{
    fetch(process.env.REACT_APP_BACKEND_LOCATION + '/groups/')
    .then((response)=>response.json())
    .then((data)=>setGroups(data))
    },[newEntry.groupPainting, newEntry.groupSequenz])



  return (
    <div className='Postform'>
      {!newEntry.media && <UploadWidget receivedUrl={handleEnteredUrl}/>}
      <form onSubmit={handleSubmit}>
      {newEntry.media && 
      <>
        <label>Media:</label>{'...' + newEntry.media.secure_url.slice(40)}<br/>
        <img src={newEntry.media.thumbnail_url} alt="your uploaded file"/><br/>
        <button onClick={handleDeleteMedia}>delete media</button><br/>
      </>}
      <label>title: <input type='text' name='title' onChange={handleChangedValue}/></label><br/>
      <label>text: <input type="text" name="text" onChange={handleChangedValue}/></label><br/>
      <label>url: <input type="text" name="url" onChange={handleChangedValue}/></label><br/>
    <GroupList type="painting" items={groups.filter(e=>e.group_type==="painting")} selected={newEntry.groupPainting} changeSelection={handleSelectionChange}/>


    <GroupList type="sequenz" items={groups.filter(e=>e.group_type==="sequenz")} selected={newEntry.groupSequenz} changeSelection={handleSelectionChange}/>
          <button type='submit' onClick={handleSubmit}>Submit</button>


      </form>
        {JSON.stringify(newEntry)}

    </div>
  )
}

export default Post2