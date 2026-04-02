import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import DashboardLayout from './layout/DashboardLayout.jsx';
import faktur from './PagesDesktop/faktur.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <h1>Dashboard</h1>
            </DashboardLayout>
          }
        />

        {/* Invoice 1 */}
        <Route
          path="/faktur"
          element={
            <DashboardLayout>
              <faktur />
            </DashboardLayout>
          }
        />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;