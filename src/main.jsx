import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import NavContext from './context/NavContext.jsx'
import { SoundProvider } from './context/SoundContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavContext>
        <SoundProvider>
          <App />
        </SoundProvider>
      </NavContext>
    </BrowserRouter>
  </React.StrictMode>,
)
