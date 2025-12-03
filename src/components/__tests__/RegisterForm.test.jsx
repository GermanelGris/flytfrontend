import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from 'react-router-DOM'; // Memory Router
import RegisterForm from "../RegisterForm";

describe('Componente RegisterForm', () => {
    it('Debe limpiar los campos después de enviar form exitoso', () => {
        render(
            <MemoryRouter>
                <RegisterForm />
            </MemoryRouter>
        );

        const nombre = screen.getByLabelText(/Nombre/i);
        const apellido = screen.getByLabelText(/Apellido/i);
        const email = screen.getByLabelText(/Correo Electrónico/i);
        const fono = screen.getByLabelText(/Teléfono/i);
        const cumpleaños = screen.getByLabelText(/Fecha de Nacimiento/i);
        const contrasena = screen.getByLabelText(/^Contraseña/i);
        const validaContrasena = screen.getByLabelText(/Confirmar Contraseña/i);

        const boton = screen.getByRole('button', { name: /Crear Cuenta/i });

        fireEvent.change(nombre, { target: { value: 'Sara' } });
        fireEvent.change(apellido, { target: { value: 'Connor' } });
        fireEvent.change(email, { target: { value: 'sara.connor@skynet.com' } });
        fireEvent.change(fono, { target: { value: '1234567890' } });
        fireEvent.change(cumpleaños, { target: { value: '1986-01-18' } });
        fireEvent.change(contrasena, { target: { value: 'aA!!12345678' } });
        fireEvent.change(validaContrasena, { target: { value: 'aA!!12345678' } });
        fireEvent.click(boton);


        expect(nombre.value).toBe('');
        expect(apellido.value).toBe('');
        expect(email.value).toBe('');
        expect(fono.value).toBe('');
        expect(cumpleaños.value).toBe('');
        expect(contrasena.value).toBe('');
        expect(validaContrasena.value).toBe('');

    });
    it('Debe mostrar un error si las contraseñas no coinciden', () => {
        render(
            <MemoryRouter>
                <RegisterForm />
            </MemoryRouter>
        );

        // 1. Obtenemos los campos y el botón
        const contrasenaInput = screen.getByLabelText(/^Contraseña/i);
        const confirmarContrasenaInput = screen.getByLabelText(/Confirmar Contraseña/i);
        const boton = screen.getByRole('button', { name: /Crear Cuenta/i });

        // 2. Ingresamos contraseñas diferentes
        fireEvent.change(contrasenaInput, { target: { value: 'passwordValida123' } });
        fireEvent.change(confirmarContrasenaInput, { target: { value: 'passwordDiferente456' } });

        // 3. Hacemos clic en el botón para disparar la validación
        fireEvent.click(boton);

    });
    it('Debe mostrar la fuerza de la contraseña como "Muy Fuerte" al cumplir los criterios', () => {
    render(
        <MemoryRouter>
            <RegisterForm />
        </MemoryRouter>
    );

    // 1. Obtenemos el campo de contraseña
    const contrasenaInput = screen.getByLabelText(/^Contraseña/i);

    // 2. Escribimos una contraseña fuerte
    // (Largo > 8, mayúscula, número, símbolo)
    fireEvent.change(contrasenaInput, { target: { value: 'PassWord123!' } });

    // 3. Verificamos que el texto "Fuerte" aparece en la pantalla
    const textoFuerza = screen.getByText('Muy fuerte');
    expect(textoFuerza).toBeInTheDocument();

    });
});