import React, { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from './hooks/useAuth';

const Login = () => {
  const {setAuth} = useAuth();
  let navigate = useNavigate();
  const { state } = useLocation();
  const [apiError,setApiError] = useState();

  const onFormReset = ()=> {
    navigate("/", {replace:true});
  }

  const onFormSubmit = async (e)=>{
    let dict = {email: e.target.email.value, password: e.target.password.value}    
    e.preventDefault();
    const timeout = 8000;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout); 
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_LOCATION + "/users/login", {
        signal:controller.signal,
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(dict)});
        if (response.ok){
          const token = await response.json()
          setAuth(token["token"]);
          const d = new Date();
          d.setTime(d.getTime() + (31*24*60*60*1000));
          document.cookie = "token="+token["token"]+"; expires="+d+ ";path=/;samesite=strict";
          navigate(state===null ? "/" :  state.prev , {replace:true});
        } else{
          let errorResponse = await response.json();
          setApiError(errorResponse["detail"]);
          setAuth(null);
        }
    } catch (error) {
      if (error.name==='AbortError'){
        setApiError('Possible Timeout')
      } else {
        setApiError(error.message)
      }
    };
    clearTimeout(id);
    }

  return (
    <div className='Postform'>
      <form onSubmit={onFormSubmit} onReset={onFormReset}>
        E-Mail:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type="text" name="email" required/><br/>
        Passwort: &nbsp;&nbsp;<input type="password" name="password" required/><br/>
        <p >&nbsp; {apiError}</p>
        <input type="submit"/> <br/>
        <input type="reset"/>
      </form>
  </div>
  )
}

export default Login