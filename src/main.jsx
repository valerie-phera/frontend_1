import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.jsx'
import { BrowserRouter } from 'react-router-dom'
import DeviceFrame from "./components/Layout/DeviceFrame/DeviceFrame.jsx";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <DeviceFrame>
        <App />
      </DeviceFrame>
    </BrowserRouter>
  // </StrictMode>,
)
