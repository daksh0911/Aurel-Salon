import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth';
import { ToastProvider } from './components';
import './index.css';
createRoot(document.getElementById('root')).render(<HashRouter><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></HashRouter>);
