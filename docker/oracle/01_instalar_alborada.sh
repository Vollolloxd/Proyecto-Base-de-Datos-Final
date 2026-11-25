#!/bin/bash
# =====================================================================
# Se ejecuta UNA sola vez, la primera vez que se crea la base (volumen
# vacio). Crea el esquema ALBORADA en FREEPDB1, instala el proyecto
# (script final.sql) y carga los datos de demostracion (DATOS_DEMO.sql).
#
# Nota: la imagen gvenzl/oracle-free ejecuta este archivo con "source",
# por eso no se usa "exit" ni "set -e".
# =====================================================================

alborada_instalar() {
    local CLAVE="${ALBORADA_CLAVE:-Alborada2026}"
    local USUARIO="${ALBORADA_USUARIO:-ALBORADA}"
    local SQL="${ALBORADA_SQL_DIR:-/alborada/sql}"
    local DATOS="${ALBORADA_DATOS_DIR:-/opt/oracle/oradata}"
    local LOG="$DATOS/alborada_instalacion.log"
    local CONEXION="${USUARIO}/${CLAVE}@//localhost:1521/FREEPDB1"
    export NLS_LANG=AMERICAN_AMERICA.AL32UTF8

    echo "[Alborada] 1/3 Creando el esquema ${USUARIO}..."
    sqlplus -s -L / as sysdba > "$LOG" 2>&1 <<EOF
WHENEVER SQLERROR EXIT FAILURE
ALTER SESSION SET CONTAINER = FREEPDB1;
CREATE USER ${USUARIO} IDENTIFIED BY "${CLAVE}"
    DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE PROCEDURE,
      CREATE TRIGGER, CREATE VIEW, CREATE TYPE TO ${USUARIO};
EXIT
EOF
    if [ $? -ne 0 ]; then
        echo "[Alborada] ERROR al crear el usuario. Ver $LOG"; cat "$LOG"; return 1
    fi

    echo "[Alborada] 2/3 Instalando script final.sql (tablas, triggers, CRUD, gestores, reportes)..."
    { echo "SET DEFINE OFF"; tr -d '\r' < "$SQL/script final.sql"; echo; echo "EXIT"; } \
        | sqlplus -s -L "$CONEXION" >> "$LOG" 2>&1

    # Resultado esperado: "16:0" (16 tablas CEMJ_ y 0 objetos invalidos)
    local ESTADO
    ESTADO=$(sqlplus -s -L "$CONEXION" <<'EOF' | tr -d '[:space:]'
SET HEADING OFF FEEDBACK OFF PAGESIZE 0
SELECT (SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME LIKE 'CEMJ%') || ':' ||
       (SELECT COUNT(*) FROM USER_OBJECTS WHERE STATUS <> 'VALID') FROM DUAL;
EXIT
EOF
)
    echo "[Alborada]     tablas:invalidos = $ESTADO"
    if [ "${ESTADO#*:}" != "0" ] || [ "${ESTADO%%:*}" = "0" ] || [ -z "$ESTADO" ]; then
        echo "[Alborada] ERROR al instalar el proyecto. Ver $LOG"; tail -60 "$LOG"; return 1
    fi

    echo "[Alborada] 3/3 Cargando DATOS_DEMO.sql (4 meses de ventas de ejemplo)..."
    { tr -d '\r' < "$SQL/DATOS_DEMO.sql"; echo; echo "EXIT"; } \
        | sqlplus -s -L "$CONEXION" >> "$LOG" 2>&1
    if [ $? -ne 0 ]; then
        echo "[Alborada] ERROR al cargar los datos de demo. Ver $LOG"; tail -60 "$LOG"; return 1
    fi

    # Marca que usa el healthcheck: la app web arranca recien cuando existe
    touch "$DATOS/alborada_lista"
    echo "[Alborada] Base instalada y con datos de demostracion. Detalle en $LOG"
}

alborada_instalar
