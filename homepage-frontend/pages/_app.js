import '../styles/globals.css'
import Header from '../components/Header'

import {AuthProvider} from '../context/AuthContext'


function MyApp({ Component, pageProps }) {

  return (
    <AuthProvider>
      <div>
        <Header/>
        <Component {...pageProps} />      
      </div>
    </AuthProvider>
  )
}
export default MyApp
