import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import DashboardLayout from './layout/DashboardLayout.jsx';
import Faktur from './PagesDesktop/faktur.jsx';
import Dashboard from './PagesDesktop/dashboard.jsx'
import LandingPage from './PagesDesktop/LandingPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>


        {/* landingPage */}
        <Route
          path="/"
          element={
            
             <LandingPage />
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
             <Dashboard />
            </DashboardLayout>
          }
        />

        {/* Invoice 1 */}
        <Route
          path="/faktur"
          element={
            <DashboardLayout>
              <Faktur />
            </DashboardLayout>
          }
        />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;