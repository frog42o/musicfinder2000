
import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './components/HomeComponents/Home'

import NoMatch from "./components/NoMatch"
import CallBack from './CallBack'
import Dashboard from './components/Dashboard/Dashboard'
import { Authorization } from './utils/Authorization'
import AnalyzePlaylist from './components/AnalyzePlaylist/AnalyzePlaylist'
function App() {
  return (
    <>
    <Authorization>
      <Routes>
        <Route path ="/" element={<Home/>}/>
        <Route path = "/callback" element = {<CallBack/>}/>
        <Route path = "/dashboard" element = {<Dashboard/>}/>
        <Route path = "/analyze" element = {<AnalyzePlaylist/>}/>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Authorization>
    </>
  )
}

export default App
