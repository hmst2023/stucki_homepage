import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Header = () => {
  const {auth, setAuth} = useAuth();
  let navigate=useNavigate();
  const Mailto = ({ email, children }) => {
    return <a href={`mailto:${email}`}>{children}</a>;
  };
  
  const logout = function(){
    setAuth('');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;"+ ";path=/";
    window.location.assign(process.env.REACT_APP_LOCATION) 
  }
  const login = function(){
    navigate('/login', {replace:true});
  }

  const LogButton = ({auth})=> {
    return auth ? <button onClick={logout}>logout</button> : <button width="100%" height="100%" onClick={login}>login</button>
  }  
  return (
    <div className='bg-orange-200 flex flex-row justify-between items-center'>
        <Link to="/">Homepage</Link>
        <Link to="/modify">Modify</Link>
        <LogButton auth={auth}/>
    </div>
  )
}

export default Header