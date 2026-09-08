import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { CidadeProvider } from './lib/cidade.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CidadeProvider>
          <App />
        </CidadeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
