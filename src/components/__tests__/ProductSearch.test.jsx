import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest'; 
import ProductSearch from '../ProductSearch';


// Usamos beforeEach para asegurarnos de que los mocks se reinicien en cada test
    beforeEach(() => {
        // Mock para fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([]),
            })
        );
        // Mock para alert
        global.alert = vi.fn();
        // Mock para window.location
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' }
        });
    });

describe('Componente ProductSearch', () => {
it('Debe mostrar una alerta si Origen y Destino están vacíos', () => {
        render(<ProductSearch />);
        
        fireEvent.click(screen.getByRole('button', { name: /Buscar Vuelos/i }));
        
        expect(global.alert).toHaveBeenCalledTimes(1);
        expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('El Origen no puede ir vacío')
        );
        expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('El Destino no puede ir vacío')
        );
        expect(window.location.href).not.toBe('/vuelos');
    });
});