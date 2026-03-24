import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import DashboardLayout from './layout/DashboardLayout.jsx';
import Invoice from './PagesDesktop/invoice.jsx';


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
          path="/invoice"
          element={
            <DashboardLayout>
              <Invoice />
            </DashboardLayout>
          }
        />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;