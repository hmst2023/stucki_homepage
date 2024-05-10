import { useContext } from "react";
import ScreenContext from "../context/ScreenProvider";
const useCheckSmallscreen =()=>{
    return useContext(ScreenContext)
}
export default useCheckSmallscreen;