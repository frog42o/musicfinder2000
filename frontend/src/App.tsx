
import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './components/Home'
import Profile from './components/Profile'
import MenuBar from './components/MenuBar'
import NoMatch from "./components/NoMatch"
function App() {
  return (
    <>
    <MenuBar/>
    <Routes>
      <Route path ="/" element={<Home/>}/>
      <Route path ="/profile" element={<Profile/>}/>
      <Route path="*" element={<NoMatch />} />
    </Routes>
    </>
  )
}

export default App
