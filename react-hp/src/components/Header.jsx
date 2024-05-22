import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCheckSmallscreen from '../hooks/useCheckSmallscreen'
import './Header.css'

const Header = () => {
  const smallscreen = useCheckSmallscreen()
  const {auth, setAuth} = useAuth();
 const [menue, setMenue] = useState(false);

  let navigate = useNavigate();
  const Mailto = ({ email, children }) => {
    return <a href={`mailto:${email}`}>{children}</a>;
  };
  
  
  const toggleMenue = () => {
    if (!menue){
      window.addEventListener('mouseup', function(){
        setTimeout(setMenue,200, false)
      }, {once:true})
    } 
    setMenue(!menue)
  }
  


  const LogButton = ({auth})=> {
    const logout = function(){
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
      setAuth('');
      navigate("/", {replace:true});
    }
    return <button onClick={logout}>logout</button>
  }

  const NavBarSmall = () =>{
    return(
      <div className='dropdownbutton'>
          <button onClick={toggleMenue}>
            {menue ? '\u25B2':'\u25BC'}
          </button>
          {menue && <NavBarBig/>}
      </div>
    )
  }
  const NavBarBig = () =>{
    return(
      <div>
        <ul>
          <li><Link to="/">Arbeiten</Link></li>
          <li><Mailto email="info@stucki.cc">Kontakt</Mailto></li>
          <li><Link to="/impressum">Impressum</Link></li>
          <li><Link to="/datenschutz">Datenschutz</Link></li>
          {auth && <>
                      <li style={{marginTop:'40px'}}><Link to="post">Post</Link></li>
                      <li><Link to="post2">Post2</Link></li>
                      <li><LogButton/></li>
                      </>}

          </ul>
      </div>
          
    )
  }

  return (
    <div className="Header">
        <div>
          <h1>stucki.cc</h1>
          <h2>Stucki - Artist's profile</h2>
        </div>
        { smallscreen ? <NavBarSmall/> : <NavBarBig/>}
    </div>
  )
}

export default Header