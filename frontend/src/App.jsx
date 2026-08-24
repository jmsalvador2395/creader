import Navbar from './components/Navbar'
import { routes } from './routes/routes'
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext'
import Login from './pages/Login' 
import Register from './pages/Register' 


function App() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div>Loading...</div>
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="*" element={<Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />}/>
      </Routes>
    )
  }

  return (
    <>
    <Navbar routes={ routes }/>
    <Routes>
    {
      routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))
    }
    </Routes>
    </>
  )
}

export default App
