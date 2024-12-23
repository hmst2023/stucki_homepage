import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Start from './Start.js';
import Login from './Login.js';
import Entry from './Entry.js';
import TermsOfUse from './TermsOfUse.js';
import Datenschutz from './Datenschutz.js';
import Impressum from './Impressum.js';
import RequiredAuthentication from './RequiredAuthentication.js';
import Post from './Post.js';
import Canvas from './Canvas.js';
import Portfolio from './Portfolio.js';
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Start/>}/>
        <Route path="login" element={<Login/>}/>
        <Route path="entries/:id" element={<Entry/>}/>
        <Route path="portfolio" element={<Portfolio/>}/>
        <Route path="termsofuse" element={<TermsOfUse/>}/>
        <Route path="datenschutz" element={<Datenschutz/>}/>
        <Route path="impressum" element={<Impressum/>}/>
        <Route element={<RequiredAuthentication/>}>
          <Route path="post" element={<Post/>}/>
          <Route path='canvas' element={<Canvas/>}/>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
