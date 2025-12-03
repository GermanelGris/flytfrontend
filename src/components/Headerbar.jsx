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
              
              <Link to="/login" className="btn-iniciar" id="btn-iniciar">
                Iniciar Sesión
              </Link>
              
              <Link to="/registro" className="btn-Registro" id="btn-Registro">
                Registrarse
              </Link>
            </div>
        </header>
    );
}

export default Headerbar;