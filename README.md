# Viña La Alborada — Proyecto final Base de Datos

Base de Datos · Sección 2 · Profesor Carlos Castro
Integrantes: Mauricio Castro, Emerson Fuenzalida, José Cáceres, Cristóbal Villalobos

| Carpeta | Contenido |
|---|---|
| `Base de datos/script final.sql` | Script completo de Oracle: tablas, secuencias, triggers, CRUD, gestores, reportes, control de acceso y monitoreo (prefijo `CEMJ_`). |
| `Base de datos/DATOS_DEMO.sql` | Datos de demostración: usuarios, clientes, productos y 4 meses de ventas. **Sin este script la base queda vacía y no hay usuarios para iniciar sesión.** |
| `Pagina Web/` | Tienda pública y panel de gestión. Backend Node.js + Express (MVC) que solo invoca procedimientos y funciones de Oracle; frontend React + Tailwind (MVC). |
| `docker-compose.yml`, `docker/` | Levanta Oracle + la página con un solo comando. |

## Opción A: con Docker (recomendado)

Requisitos: **Docker Desktop**, unos 3 GB de RAM libres y 4 GB de disco.

```
git clone https://github.com/Vollolloxd/Proyecto-Base-de-Datos-Final
cd Proyecto-Base-de-Datos-Final
docker compose up -d
```

- **La primera vez tarda entre 5 y 10 minutos**: descarga Oracle, crea el esquema `ALBORADA`,
  instala `script final.sql` y carga `DATOS_DEMO.sql`. La página espera a que todo esté listo.
- Avance: `docker compose logs -f db` (al final dice `[Alborada] Base instalada y con datos de demostracion`).
- Luego abrir **http://localhost:3001**. Las siguientes veces arranca en segundos.

| Qué | Comando |
|---|---|
| Detener todo | `docker compose down` |
| Reiniciar la base desde cero (borra los datos) | `docker compose down -v` y luego `docker compose up -d` |
| Reconstruir la página tras cambios | `docker compose up -d --build web` |
| Modo desarrollo (recarga automática, http://localhost:5173) | `docker compose --profile dev up` |
| Consola SQL | `docker compose exec db sqlplus ALBORADA/Alborada2026@//localhost/FREEPDB1` |

SQL Developer: host `localhost`, puerto `1521`, servicio `FREEPDB1`, usuario `ALBORADA`, clave `Alborada2026`.

> Si el PC ya tiene un Oracle instalado, el puerto 1521 estará ocupado: detener ese Oracle o
> cambiar `"1521:1521"` por `"1522:1521"` en `docker-compose.yml`.

## Opción B: con un Oracle ya instalado (sin Docker)

1. Crear el esquema (como SYSTEM, en la PDB `FREEPDB1`):
   ```sql
   CREATE USER ALBORADA IDENTIFIED BY "Alborada2026"
       DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
   GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE PROCEDURE,
         CREATE TRIGGER, CREATE VIEW, CREATE TYPE TO ALBORADA;
   ```
2. Conectado como `ALBORADA`, ejecutar como script (F5) `Base de datos/script final.sql`
   y **después** `Base de datos/DATOS_DEMO.sql`.
3. Copiar `Pagina Web/backend/.env.example` como `.env` y ajustar la conexión.
4. Requiere Node.js 18+. Doble clic en `Pagina Web/INICIAR.cmd` y abrir http://localhost:3001

## Usuarios de demostración (los crea `DATOS_DEMO.sql`)

| Correo | Perfil | Contraseña |
|---|---|---|
| admin@alborada.cl | Administrador | Alborada2026 |
| ventas1@alborada.cl | Vendedor | Ventas2026 |
| camila.rojas@correo-demo.cl | Cliente web | Cliente2026 |

La estructura MVC y el guion de la demostración están en `Pagina Web/README.md`.
