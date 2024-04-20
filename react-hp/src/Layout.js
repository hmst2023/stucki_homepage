import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import RightNav from './components/RightNav';

const Layout = () => {
  return (
            <div className='All'>
                <Header/>
                <main className='Outlet'>
                  <Outlet/>
                </main> 
                <RightNav/>   
            </div>
  );
};

export default Layout;