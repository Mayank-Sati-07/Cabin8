import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import LiquidCursor from './components/LiquidCursor';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LiquidCursor />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
