import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '../../../src/context/AppContext';
import { crewRouter } from './router';
import '../../../src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={crewRouter} />
    </AppProvider>
  </React.StrictMode>
);
