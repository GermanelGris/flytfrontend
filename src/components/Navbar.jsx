import { useState, useEffect } from 'react';

function Navbar(){
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const res = await fetch('http://localhost:8090/api/clientes/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const userData = await res.json();

                const admin = userData.roles && Array.isArray(userData.roles) && userData.roles.includes('ADMIN');

                setIsAdmin(admin);
            } catch (e) {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return null;
    if (!isAdmin) return null;

    return(
     <nav className="main-nav">
    <ul>
      <li><a href="./excel" className="nav-link">excel</a></li>
      <li><a href="./grafico" className="nav-link">Grafico</a></li>
      <li><a href="./contacto" className="nav-link">Contacto</a></li>
      <li><a href="./admin-vuelos" className="nav-link">Administrar Vuelos</a></li>
    </ul>
  </nav>
    );
}

export default Navbar;