import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from './hooks/useAuth';

const Entry = () => {
  const {auth, setAuth} = useAuth();
  const [entry, setEntry] = useState({});
  const [error, setError] = useState('');
  const {id} = useParams();
  let navigate = useNavigate();

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
  useEffect(()=>{
    getEntry();
  },[])

  return (
    <div>
      <p>{entry._id}</p>
      <p>Text: {entry.text}</p>
      <p>{entry.img && <img src={entry.img}/>}</p>
      <p>Timestamp: {entry.timestamp}</p>
      <p>Group-Painting:<Link to={"/groups/"+entry.group_painting}> {entry.group_painting}</Link></p>
      <p>Group-Sequenz: <Link to={"/groups/"+entry.group_sequenz}>{entry.group_sequenz}</Link></p>
      <p>Video: {entry.video}</p>
      {auth && <button onClick={handleDelete}>Delete</button>}
      {error}
    </div>
  )

  }
export default Entry