import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="container animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
