// Vista: entrega la aplicacion React compilada (frontend/dist); cualquier ruta que no sea /api abre index.html
const path = require('path');
const fs = require('fs');
const express = require('express');

const carpetaWeb = path.join(__dirname, '..', '..', '..', 'frontend', 'dist');

function montarAplicacionWeb(app) {
    if (!fs.existsSync(carpetaWeb)) {
        return false;
    }
    app.use(express.static(carpetaWeb));
    app.get('*', (req, res) => res.sendFile(path.join(carpetaWeb, 'index.html')));
    return true;
}

module.exports = { montarAplicacionWeb };
