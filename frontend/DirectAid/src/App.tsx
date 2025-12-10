// import React from 'react'
import AppRouter from './router/AppRouter';
import './styles/App.css';
import { AppProvider } from "./contexts/AppContext";

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
