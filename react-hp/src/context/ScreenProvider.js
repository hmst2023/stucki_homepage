import { createContext, useState, useEffect} from "react"

const ScreenContext = createContext({})
export const ScreenProvider = ({children}) => {
    const smallscreenSize = 1024
    const [smallscreen, setSmallscreen] = useState(window.innerWidth<smallscreenSize);
    
    useEffect(()=>{
      function checkWidth(){
        const actualWidth = window.innerWidth
        if ((actualWidth<smallscreenSize)) {
          setSmallscreen(true)
        } else if ((actualWidth>smallscreenSize)){
          setSmallscreen(false)
        }
      }
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
      },[]);
  
    return <ScreenContext.Provider value={smallscreen}>
    {children}
    </ScreenContext.Provider>
}
export default ScreenContext