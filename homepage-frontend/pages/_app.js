import '../styles/globals.css'
import Header from '../components/Header'
import  RightNav from '../components/RightNav'

import {AuthProvider} from '../context/AuthContext'


function MyApp({ Component, pageProps }) {

  return (
    <AuthProvider>
      <div className='flex flex-row'>
        <Header/>
        <Component {...pageProps} />
        <RightNav/>
      </div>
    </AuthProvider>
  )
}
export default MyApp
