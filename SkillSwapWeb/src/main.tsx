import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

// Auth0 configuration - these would typically come from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-skillswap.us.auth0.com'
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id'

// Root path for custom domain
const basename = ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "skillswapapi",
        scope: "openid profile email"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        // Handle the redirect callback
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname
        );
      }}
    >
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
)