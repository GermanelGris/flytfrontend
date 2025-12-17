import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import Navbar from '../Navbar.jsx';

describe('Componente Navbar',() => {
    beforeEach(() => {
        cleanup();
        // simular token y respuesta de usuario admin
        localStorage.setItem('token', 'fake-token');
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ roles: ['ADMIN'] })
        }));
    });

    afterEach(() => {
        localStorage.clear();
        vi.resetAllMocks();
    });

    it('debe contener los enlaces de navegación', async () => {
        render(<Navbar/>);

        const linkExcel = await screen.findByText(/excel/i);
        const linkGrafico = await screen.findByText(/grafico/i);

        expect(linkExcel).toBeInTheDocument();
        expect(linkGrafico).toBeInTheDocument();

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    })
});