import './App.css'
import Navbar from './components/Navbar.jsx'
import Headerbar from './components/Headerbar.jsx'
import ProductSearch from './components/ProductSearch.jsx' 
import Login from './components/Login.jsx'
import FlightList from './components/FlightList.jsx'
import ChartSection from './components/ChartSection.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-DOM'
import RegisterForm from './components/RegisterForm.jsx'
import './CSS/registro.css'
import './CSS/login.css'
import './CSS/vuelos.css'
import './CSS/datatable.css'
import './CSS/chartsection.css'
import './CSS/flightadmin.css'
import DataTable from './components/DataTable.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HeaderLog from './components/HeaderLog.jsx'
import Contact from './components/Contact.jsx'
import FlightAdmin from './components/FlightAdmin.jsx'

function App() {
   return (
    <>
    <Router>
      <Routes>
      
        <Route path="*" element={
            <>
            <Headerbar/>
            
            <ProductSearch/>
            </>
        }/>
        <Route path="/Registro" element={
          <>
          <RegisterForm/>
          </>

        }/>  
        <Route path="/login" element={
          <>
          <Login/>
          </>

        }/>
        <Route path="/vuelos" element={
          <>
          <ProtectedRoute>
            <HeaderLog/>
            <Navbar/>
          <FlightList/>
          </ProtectedRoute>
          </>

        }/>
        <Route path="/excel" element={
          <>
            <ProtectedRoute>
            <HeaderLog/>
            <Navbar/>
            <DataTable/>
            </ProtectedRoute>
          </>

        }/>
        <Route path="/grafico" element={
          <>
            <ProtectedRoute>
              <HeaderLog/>
              <Navbar/>
            <ChartSection/>
            </ProtectedRoute>
          </>

        }/>
        <Route path="/contacto" element={
          <>
            <ProtectedRoute>
              <HeaderLog/>
              <Navbar/>
              <Contact/>
            </ProtectedRoute>
          </>

        }/>
        <Route path="/admin-vuelos" element={
          <>
            <ProtectedRoute>
              <HeaderLog/>
              <Navbar/>
              <FlightAdmin/>
            </ProtectedRoute>
          </>

        }/>   

      </Routes>
      
    </Router>
    </>
  )
}

export default App