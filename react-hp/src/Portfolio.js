import React from 'react'
import { useState, useEffect } from 'react'
import CardCollection from './components/CardCollection';

const Portfolio = () => {
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState('');
    const getEntries = async () => {
        const timeout = 12000;
        const controller = new AbortController();
        const id2 = setTimeout(() => controller.abort(), timeout);
        
        try {
          const res = await fetch(process.env.REACT_APP_BACKEND_LOCATION+'/entries/material/code', {
            signal: controller.signal,
            method:"GET",
          });
          if (!res.ok){
            let errorResponse = await res.json();
            setError(errorResponse["detail"]);
          } else {
            setEntries(await res.json())
            setError([])
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
    useEffect(()=>{
        getEntries();
    },[]);
  
  return (
    <CardCollection items={entries}/>
  )
}

export default Portfolio