// Sistema de Gestion Viña La Alborada
// Ramo: Base de Datos - Seccion 2
// Profesor: Carlos Castro
// Integrantes: Mauricio Castro, Emerson Fuenzalida, José Cáceres, Cristóbal Villalobos
// Punto de entrada: monta la aplicacion React con el enrutador y los estilos
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './estilos/estilos.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
