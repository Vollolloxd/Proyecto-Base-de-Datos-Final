// Aplicacion Express: API en /api (rutas -> controladores -> modelos) y la vista web en /
const express = require('express');
const cors = require('cors');
const rutasApi = require('./rutas');
const { montarAplicacionWeb } = require('./vistas/aplicacionWeb');
const { manejarError } = require('./middlewares/manejoErrores');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', rutasApi);
montarAplicacionWeb(app);
app.use(manejarError);

module.exports = app;
