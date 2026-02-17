import { useState } from 'react'
import './App.css'
import Navbar from './components/navbar'
import { routes } from './routes/routes'
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <>
        <Navbar routes={ routes }/>
        <Routes>
        {
            routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))
        }
        </Routes>
    </>
  )
}

export default App
