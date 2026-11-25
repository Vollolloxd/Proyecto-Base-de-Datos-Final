# Viña La Alborada — Proyecto final Base de Datos

Base de Datos · Sección 2 · Profesor Carlos Castro
Integrantes: Mauricio Castro, Emerson Fuenzalida, José Cáceres, Cristóbal Villalobos

| Carpeta | Contenido |
|---|---|
| `Base de datos/script final.sql` | Script completo de Oracle: tablas, secuencias, triggers, CRUD, gestores, reportes, control de acceso y monitoreo (prefijo `CEMJ_`). |
| `Pagina Web/` | Tienda pública y panel de gestión. Backend Node.js + Express (MVC) que solo invoca procedimientos y funciones de Oracle; frontend React + Tailwind (MVC). |

## Puesta en marcha

1. Ejecutar `Base de datos/script final.sql` en el esquema de Oracle.
2. Copiar `Pagina Web/backend/.env.example` como `.env` y ajustar la conexión.
3. Doble clic en `Pagina Web/INICIAR.cmd` y abrir http://localhost:3001

La estructura MVC y los usuarios de demostración están descritos en `Pagina Web/README.md`.
