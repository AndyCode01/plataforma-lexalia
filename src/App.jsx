import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { allRoutes } from './config/routes';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        {allRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
