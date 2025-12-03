import {render, screen} from '@testing-library/react';
import Navbar from '../Navbar.jsx';

describe('Componente Navbar',() => {
    it('debe contener los enlaces de navegación',() => {
        render(<Navbar/>);
        const linkExcel = screen.getByText(/excel/i);
        const linkGrafico = screen.getByText(/grafico/i);

        expect(linkExcel).toBeTruthy();
        expect(linkGrafico).toBeTruthy();
    })
});