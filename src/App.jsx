import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Sidebar from './component/Sidebar'
import ContactsPage from './pages/Contact'
import Dashbord from './pages/Dashbord'
import Corporate from './pages/Corporate'
import Register from './pages/Register'


const App = () => {
  const location = useLocation();
  const showNavbar = true;
  return (
    <div>
     
      {showNavbar&&<Sidebar/>}
      <div className={showNavbar&&'ml-64'}>
        <Routes>
          {/* <Route path='/' element={<Login />}></Route> */}
          <Route path='/' element={<Dashbord/>}></Route>
          <Route path='/dashbord' element={<Dashbord/>}></Route>
          <Route path='/contact' element={<ContactsPage />}></Route>
          <Route path='/corporate' element={<Corporate />}></Route>
          <Route path='/register' element={<Register />}></Route>
        </Routes>
        </div>
     
    </div>
  )
}

export default App
