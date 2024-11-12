
import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './components/Home'
import Profile from './components/Profile'

import NoMatch from "./components/NoMatch"
function App() {
  return (
    <>
    <Routes>
      <Route path ="/" element={<Home/>}/>
      <Route path ="/profile" element={<Profile/>}/>
      <Route path="*" element={<NoMatch />} />
    </Routes>
    </>
  )
}

export default App
