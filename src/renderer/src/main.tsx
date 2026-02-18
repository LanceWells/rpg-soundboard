import './output.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createRootRoute, createRouter } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => <App />
})

const routeTree = rootRoute.addChildren([])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/**
 * Keep this as the root render node for the application. This should be considered necessary
 * boilerplate, and we keep the contents of the app within {@link App}.
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
