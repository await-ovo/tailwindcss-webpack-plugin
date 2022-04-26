import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header bg-red-100">
        <img src={logo} className="animate-bounce h-28 w-28" alt="logo" />
        <p className="select2-dropdown font-bold text-red-400 bg-yellow-200">
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="text-yellow-500 mt-6"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
