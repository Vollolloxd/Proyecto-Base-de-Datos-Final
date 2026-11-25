# Viña La Alborada — Aplicación web

Aplicación web del proyecto final INF324 (ES3). Arquitectura en dos capas:

| Capa | Tecnología | Qué hace |
|---|---|---|
| **Cliente** | React (Vite) + Tailwind CSS + Recharts | Pantallas, formularios y gráficos. No contiene lógica de negocio. |
| **Servicios** | Node.js + Express + `oracledb` | API que **solo invoca** procedimientos (`CEMJ_PA_*`) y funciones (`CEMJ_FN_*`) de Oracle. No escribe consultas SQL. |
| **Base de datos** | Oracle (esquema `ALBORADA`) | Toda la lógica: validaciones, cálculos, gestores, reportes, permisos, auditoría. |

## Requisitos

- Node.js 18 o superior.
- La base instalada: `Scripts/.../Rama 2A.../PROYECTO_COMPLETO.sql` y luego `DATOS_DEMO.sql`.

## Iniciar (modo presentación)

1. Revisar `backend/.env` (se crea a partir de `backend/.env.example`):
   ```
   DB_USUARIO=ALBORADA
   DB_CLAVE=Alborada2026
   DB_CONEXION=localhost:1521/FREEPDB1
   ```
2. Doble clic en **`INICIAR.cmd`**, o bien:
   ```
   cd backend
   npm install
   npm start
   ```
3. Abrir **http://localhost:3001**

El backend sirve también la aplicación React ya compilada (`frontend/dist`).
Si se modifica el frontend, recompilar con `cd frontend && npm install && npm run build`.

**Modo desarrollo** (recarga automática): `npm run dev` en `backend` y `npm run dev` en
`frontend`, y abrir http://localhost:5173.

## Usuarios de demostración

| Correo | Perfil | Contraseña |
|---|---|---|
| admin@alborada.cl | Administrador | Alborada2026 |
| ventas1@alborada.cl | Vendedor | Ventas2026 |
| ventas2@alborada.cl | Vendedor | Ventas2026 |
| camila.rojas@correo-demo.cl | Cliente web | Cliente2026 |

## Cómo se cumple la rúbrica

| Requisito | Dónde |
|---|---|
| Control de acceso con perfiles | Login → `CEMJ_PA_LOGIN`; menú según `CEMJ_PA_LOGIN_MODULOS`; cada llamada valida `CEMJ_FN_PUEDE_ACCEDER` (`backend/src/middlewares/permisos.js`) |
| 10 mantenedores | Productos, Categorías, Cepas, Composición de cepas, Clientes, Usuarios, Métodos de pago, Solicitudes, Detalle de solicitud, Movimientos (`backend/src/modelos/mantenedores/`) |
| 5 gestores | G1 Aplicar movimiento (Inventario), G2 Venta presencial, G3 Solicitud → venta digital, G4 Confirmar con pago, G5 Anular (`backend/src/modelos/ventaModelo.js`, `solicitudModelo.js`, `inventarioModelo.js`) |
| 3 reportes (dashboards) | Página Reportes: ranking mensual de productos, ventas por canal, stock crítico |
| Monitoreo con triggers | Página Monitoreo: auditoría, alertas de stock, intentos de login. El backend identifica al usuario en cada conexión (`clientId`) para que los triggers registren quién hizo cada cambio |
| Lógica en la base | `backend/src/config/baseDatos.js`: solo `BEGIN CEMJ_PA_...; END;` y `:r := CEMJ_FN_...` |

## Guion sugerido para la demostración

1. Entrar como **ventas1** → Reportes: los 3 reportes con 4 meses de datos. Stock crítico muestra el
   Carignan Gran Reserva bajo el mínimo.
2. Solicitudes web → revisar una **pendiente** → Aceptar → se genera la venta digital →
   confirmarla con pago.
3. Ventas → Nueva venta presencial → agregar **7 o más Rosé de País** → confirmar.
   El Rosé cruza su mínimo y se registra una alerta.
4. Salir y entrar como **admin** → Monitoreo: aparecen el login, la venta, el movimiento,
   la alerta de stock y el pago, con el usuario que hizo cada uno.
5. Entrar como **cliente** → Catálogo → agregar productos → Mis pedidos → Enviar.

## Estructura (MVC)

La aplicación sigue el patrón **Modelo – Vista – Controlador** en las dos partes.
Cada capa solo conoce a la de abajo: **Rutas → Controladores → (Servicios) → Modelos → Oracle**.

### Backend (`backend/src`)

```
servidor.js              punto de entrada: conecta con Oracle y levanta la app
app.js                   arma Express: /api (rutas) + vista web + manejo de errores
config/
  entorno.js             lee backend/.env (puerto, Oracle, JWT)
  baseDatos.js           pool de Oracle; solo BEGIN CEMJ_PA_...; END; y :r := CEMJ_FN_...
modelos/                 MODELO: única capa que llama a Oracle (un archivo por tema)
  accesoModelo.js        login, bitácora de intentos, módulos, registro, contraseña
  catalogoModelo.js      catálogo y más vendidos
  pedidoModelo.js        pedidos del cliente web
  solicitudModelo.js     gestor G3 (enviar / resolver)
  ventaModelo.js         gestores G2, G4 y G5
  inventarioModelo.js    gestor G1
  reporteModelo.js       los 3 reportes
  monitoreoModelo.js     auditoría, alertas e intentos de login
  mantenedorModelo.js    CRUD genérico
  mantenedores/          definición de cada mantenedor (procedimientos, campos, permisos)
servicios/               lógica de la aplicación que no es SQL
  accesoServicio.js      iniciar sesión, registrar cliente, cambiar contraseña
  mantenedorServicio.js  arma los parámetros P_* de cada CRUD
  claves.js              hash de contraseñas (scrypt)
  tokens.js              JWT de la sesión
controladores/           CONTROLADOR: lee la petición, llama al modelo/servicio y responde
rutas/                   URL -> middleware -> controlador (index.js une todas en /api)
middlewares/             autenticación, permisos por módulo, recurso de mantenedor,
                         pedido propio del cliente y manejo de errores
utilidades/              errores con número (como Oracle) y envoltorio async
vistas/aplicacionWeb.js  VISTA: entrega la aplicación React compilada (frontend/dist)
```

### Frontend (`frontend/src`)

```
main.jsx / App.jsx       arranque: proveedores, verificación de edad y rutas
modelos/                 MODELO: única capa que conoce las URL de la API
  http.js                cliente HTTP (token, errores, sesión expirada)
  almacenSesion.js       sesión en localStorage
  compraPendiente.js     producto elegido antes de iniciar sesión (sessionStorage)
  *Modelo.js             acceso, catálogo, pedidos, ventas, solicitudes, inventario,
                         mantenedores, reportes y monitoreo
controladores/           CONTROLADOR: estado y lógica de cada pantalla (hooks y contextos)
  SesionContexto.jsx     usuario, módulos, login, registro y salir
  MensajesContexto.jsx   avisos de éxito y error
  useDatos.js            carga de datos de una ruta del modelo
  useTienda, useCrud, useVentaDetalle, usePedido, usePanel, useInicio, ...
vistas/                  VISTA: solo presentación (JSX + Tailwind)
  componentes/           tabla, formulario, modal, CRUD genérico, insignias, avisos
  layouts/               panel: menú lateral, cabecera, cambiar contraseña
  tienda/                portada, más vendidos, tarjetas, secciones de vino y uva, pie
  acceso/                verificación de edad, formularios de ingreso y registro
  paginas/               una carpeta por módulo (ventas, mantenedores, reportes, ...)
rutas/                   tabla de rutas, guardias (sesión y módulo) y menú del panel
utilidades/              formato CLP y fechas, RUT, tipo de producto, navegación
estilos/estilos.css      fuentes locales, tokens del DESIGN.md y clases comunes
```
