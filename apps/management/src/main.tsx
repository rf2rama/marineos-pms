import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '../../../src/context/AppContext';
import { managementRouter } from './router';
import '../../../src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={managementRouter} />
    </AppProvider>
  </React.StrictMode>
);
