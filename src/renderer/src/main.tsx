import './output.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/**
 * Keep this as the root render node for the application. This should be considered necessary
 * boilerplate, and we keep the contents of the app within {@link App}.
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
