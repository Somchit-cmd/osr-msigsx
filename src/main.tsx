import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { db } from './lib/firebase'; // Import only, don't initialize again

// Render the app only after Firebase is initialized
createRoot(document.getElementById("root")!).render(<App />);
