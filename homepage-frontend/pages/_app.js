import '../styles/globals.css'
import Header from '../components/Header'

import {AuthProvider} from '../context/AuthContext'


function MyApp({ Component, pageProps }) {

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col container p-5 mx-auto">
        <Header />
        <div className="flex-1 "><Component {...pageProps} /></div>      
      </div>
    </AuthProvider>
  )
}
export default MyApp
