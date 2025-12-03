import { Link } from 'react-router-DOM';

function Headerbar(){
    return(
        <header className="site-header">
            <div className="logo">
              <Link to="/">
                <img src="../assets/flyT_icon_128.png" alt="Logo Empresa"/>
              </Link>
            </div>
            <div className="nav-usuario">
              
              <button
                className="btn btn-danger float-end"
                onClick={() =>{
                    localStorage.removeItem("isAuthenticated");
                    window.location.href="/";
                }}>Cerrar Sesión</button>
              
              
            </div>
        </header>
    );
}

export default Headerbar;