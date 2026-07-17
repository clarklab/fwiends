import React from 'react';
import { createRoot } from 'react-dom/client';
import Widget from './Widget.jsx';
import './ai.css';

const el = document.getElementById('ai-root');
if (el) createRoot(el).render(<Widget />);
