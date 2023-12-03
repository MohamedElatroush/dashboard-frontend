// eslint-disable-next-line
// eslint-disable-next-line no-unused-vars
import './App.css';
import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PrivateRoutes from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProfile from './pages/MyProfile';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';

function App() {

  return (
    <div className="App">
      <Router>
      <AuthProvider>
        <Header />
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route element={<HomePage />} path='/' exact/>
              <Route element={<Dashboard />} path='/Dashboard' exact/>
              <Route element={<MyProfile />} path='/profile' exact />
            </Route>
            <Route element={<Login/>} path='/login/'></Route>
            <Route element={<Register/>} path='/register/'></Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
