import { useState } from 'react'
import './App.css'
import SwapSimulator from "./SwapSimulator.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
     <SwapSimulator>
    </SwapSimulator>
  )
}

export default App
