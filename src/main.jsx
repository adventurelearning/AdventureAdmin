import { StrictMode, createContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from "@apollo/client/react";
import { HttpLink } from '@apollo/client'
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `${import.meta.env.VITE_BACKEND_URL}/graphql`,
  }),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter >
      <AuthProvider>
        <ApolloProvider client={client}>

          <App />
        </ApolloProvider>
      </AuthProvider>
    </BrowserRouter>

  </StrictMode>,
)
