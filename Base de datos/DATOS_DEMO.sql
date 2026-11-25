-- =====================================================================
-- DATOS PARA LA DEMOSTRACION - VINA LA ALBORADA
--
-- Ejecutar como script (F5) INMEDIATAMENTE DESPUES de
-- script final.sql, sobre el esquema recien instalado (vacio).
-- NO ejecutar los scripts PRUEBAS_* en el mismo esquema: esos usan
-- otros datos. Para volver a cargar: script final.sql y luego este.
--
-- Que carga
--   - Roles, usuarios (administrador, 2 vendedores, clientes web),
--     clientes personas y empresas, categorias, cepas, productos con su
--     composicion, metodos de pago.
--   - Historia de ventas de los 3 meses anteriores y del mes en curso
--     (las fechas son RELATIVAS al dia en que se ejecuta el script, asi
--     los reportes R1/R2/R3 siempre tienen datos del mes actual):
--     ventas presenciales (sala de ventas y feria de fin de semana),
--     solicitudes web aceptadas y rechazadas, anulaciones, merma,
--     reposiciones de bodega y un cambio de precio.
--   - Estado final pensado para la demo:
--       * Carignan Gran Reserva queda BAJO su stock minimo (R3).
--       * Rose de Pais queda justo SOBRE su minimo: una venta en vivo
--         lo hace cruzar y aparece la alerta en la auditoria.
--       * 2 solicitudes web PENDIENTES para aceptar en vivo.
--
-- Como se carga
--   Todo pasa por los mismos procedimientos que usa la aplicacion (CRUD
--   y gestores G1-G5), asi los datos cumplen todas las reglas. Los
--   gestores registran la fecha del sistema (SYSDATE); para tener
--   historia, despues de cada operacion se mueven sus fechas al dia que
--   corresponde. Durante esta carga historica se desactivan los
--   triggers de auditoria (no son acciones de usuarios) y se reactivan
--   al final: la auditoria queda vacia para registrar la demo en vivo.
--
-- Productos, precios y clientes son DE EJEMPLO (ficticios). Si la viña
-- entrega su catalogo real, se reemplaza en la seccion 2.
--
-- Usuarios para la demo (contrasena entre parentesis; la BD guarda solo
-- su hash scrypt, generado por el backend en Pagina Web/backend/src/claves.js):
--   ADMIN@ALBORADA.CL        administrador   (Alborada2026)
--   VENTAS1@ALBORADA.CL      vendedor        (Ventas2026)
--   VENTAS2@ALBORADA.CL      vendedor        (Ventas2026)
--   CAMILA.ROJAS@CORREO-DEMO.CL  cliente web (Cliente2026)  y otros 4
-- =====================================================================
SET SERVEROUTPUT ON SIZE UNLIMITED
SET DEFINE OFF
SET SQLBLANKLINES ON
SET LINESIZE 200
SET PAGESIZE 100


-- =====================================================================
-- 0. VERIFICACION: el esquema debe estar recien instalado
-- =====================================================================
PROMPT === 0. Verificando que el esquema este vacio ===
WHENEVER SQLERROR EXIT SQL.SQLCODE
DECLARE
    V_CANT NUMBER;
BEGIN
    SELECT (SELECT COUNT(*) FROM CEMJ_ROL) + (SELECT COUNT(*) FROM CEMJ_PRODUCTO)
         + (SELECT COUNT(*) FROM CEMJ_VENTA)
    INTO V_CANT FROM DUAL;

    IF V_CANT > 0 THEN
        RAISE_APPLICATION_ERROR(-20999,
            'EL ESQUEMA YA TIENE DATOS: EJECUTE PRIMERO script final.sql');
    END IF;
END;
/
WHENEVER SQLERROR CONTINUE


-- =====================================================================
-- 1. CARGA HISTORICA: se desactivan los triggers de auditoria
-- =====================================================================
PROMPT === 1. Desactivando triggers de auditoria durante la carga ===
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_INSERT DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_UPDATE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_DELETE DISABLE;
ALTER TRIGGER CEMJ_TRIGGER_INVENTARIO_ALERTA DISABLE;


-- =====================================================================
-- 2. DATOS MAESTROS (por los procedimientos CRUD)
-- =====================================================================
PROMPT === 2. Datos maestros ===

-- Roles (la tabla ROL no tiene CRUD: se cargan directo)
INSERT INTO CEMJ_ROL(ID_ROL, NOMBRE, DESCRIPCION)
VALUES(1, 'ADMINISTRADOR', 'Dueno y administracion: acceso total');
INSERT INTO CEMJ_ROL(ID_ROL, NOMBRE, DESCRIPCION)
VALUES(2, 'VENDEDOR', 'Sala de ventas: ventas, solicitudes e inventario');
INSERT INTO CEMJ_ROL(ID_ROL, NOMBRE, DESCRIPCION)
VALUES(3, 'CLIENTE', 'Cliente registrado en el sitio web');
COMMIT;

-- Categorias
EXEC CEMJ_PA_CATEGORIA_CREAR('Vinos', 'Vinos embotellados de la vina', 'botella');
EXEC CEMJ_PA_CATEGORIA_CREAR('Uva', 'Uva vinifera a granel (temporada de cosecha marzo-abril)', 'kg');

-- Cepas
EXEC CEMJ_PA_CEPA_CREAR('Pais', 'Cepa patrimonial del secano del Maule');
EXEC CEMJ_PA_CEPA_CREAR('Carmenere', 'Cepa emblema de Chile');
EXEC CEMJ_PA_CEPA_CREAR('Cabernet Sauvignon', 'Cepa tinta de guarda');
EXEC CEMJ_PA_CEPA_CREAR('Merlot', 'Cepa tinta suave');
EXEC CEMJ_PA_CEPA_CREAR('Carignan', 'Vinas viejas de secano del Maule');
EXEC CEMJ_PA_CEPA_CREAR('Sauvignon Blanc', 'Cepa blanca fresca');
EXEC CEMJ_PA_CEPA_CREAR('Chardonnay', 'Cepa blanca de cuerpo medio');

-- Metodos de pago
EXEC CEMJ_PA_METODO_PAGO_CREAR('Efectivo', 'Pago en efectivo en sala de ventas', 1);
EXEC CEMJ_PA_METODO_PAGO_CREAR('Tarjeta de debito', 'Redcompra', 1);
EXEC CEMJ_PA_METODO_PAGO_CREAR('Tarjeta de credito', 'Visa / Mastercard', 1);
EXEC CEMJ_PA_METODO_PAGO_CREAR('Transferencia', 'Transferencia bancaria', 1);

-- Clientes personas (datos ficticios)
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '16.482.913-5', 'Camila', 'Rojas', 'Fuentes', NULL, '+56 9 8123 4501', 'camila.rojas@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '13.905.274-1', 'Jorge', 'Munoz', 'Leiva', NULL, '+56 9 7342 1180', 'jorge.munoz@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '18.227.640-K', 'Valentina', 'Soto', 'Araya', NULL, '+56 9 6655 2093', 'valentina.soto@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '11.564.302-7', 'Patricio', 'Gonzalez', 'Pino', NULL, '+56 9 9012 3347', 'patricio.gonzalez@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '17.031.889-4', 'Francisca', 'Herrera', 'Vergara', NULL, '+56 9 5578 6612', 'francisca.herrera@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '15.736.418-2', 'Rodrigo', 'Castillo', 'Bravo', NULL, '+56 9 8890 1124', 'rodrigo.castillo@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '14.289.553-9', 'Andrea', 'Diaz', 'Morales', NULL, '+56 9 7231 5508', 'andrea.diaz@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '19.402.776-3', 'Matias', 'Reyes', 'Contreras', NULL, '+56 9 6409 8871', 'matias.reyes@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '12.871.095-6', 'Carolina', 'Espinoza', 'Tapia', NULL, '+56 9 9342 0716', 'carolina.espinoza@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '16.950.381-0', 'Sebastian', 'Vasquez', 'Lagos', NULL, '+56 9 5187 2290', 'sebastian.vasquez@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '10.633.247-8', 'Ricardo', 'Fuentealba', 'Saez', NULL, '+56 9 8276 4415', 'ricardo.fuentealba@correo-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('NATURAL', '18.664.120-5', 'Daniela', 'Navarro', 'Ortiz', NULL, '+56 9 7015 9932', 'daniela.navarro@correo-demo.cl');

-- Clientes empresa (datos ficticios)
EXEC CEMJ_PA_CLIENTE_CREAR('EMPRESA', '76.512.340-1', NULL, NULL, NULL, 'Restaurante Fogon del Maule Ltda.', '+56 71 241 3390', 'compras@fogondelmaule-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('EMPRESA', '77.208.914-6', NULL, NULL, NULL, 'Botilleria Don Tito SpA', '+56 71 222 8015', 'pedidos@dontito-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('EMPRESA', '96.731.550-3', NULL, NULL, NULL, 'Hotel Plaza Talca S.A.', '+56 71 251 7744', 'alimentos@hotelplazatalca-demo.cl');
EXEC CEMJ_PA_CLIENTE_CREAR('EMPRESA', '78.045.662-K', NULL, NULL, NULL, 'Distribuidora Vinos del Sur SpA', '+56 73 221 6030', 'ventas@vinosdelsur-demo.cl');

-- Usuarios: personal y clientes web (la clave se guarda como hash)
EXEC CEMJ_PA_USUARIO_CREAR(1, NULL, 'admin@alborada.cl', 'scrypt$adcf80cbb94e0199e217395978eebf9b$57bb655ad5b482af77c2c1fdc35781dc0178b0ab8b72a9cc7a5a114ebc27eecbca5499a7b2d6e304eae838b2033dd8cc6dbcd6922defbf770f9c4d6608288a93', 1);
EXEC CEMJ_PA_USUARIO_CREAR(2, NULL, 'ventas1@alborada.cl', 'scrypt$8340a23dc2b129362e2b9f7c158a02cd$07d5dad47780d799a40016423c3e28ffc10b090cfae3e30be3aabc9218c2c2623cc4e7f31a8a15743afc765c658b213c693b839c4945d3865664bec409803c8a', 1);
EXEC CEMJ_PA_USUARIO_CREAR(2, NULL, 'ventas2@alborada.cl', 'scrypt$639103a339e579a5ed8b4c71f6fbe3af$08a3200a46c9c03ce3e9cf3823d04c8c547895e26db98c2f1917c2e1241f69a337e8c7eee5f7c818c371779a8712a00a35c3d83eb4db41701d51a1add427cae8', 1);
EXEC CEMJ_PA_USUARIO_CREAR(3, 1, 'camila.rojas@correo-demo.cl', 'scrypt$a6367c4be88885d05b9be34188d13a06$8f60aa261bfd88fc921b22da314bc1e000d3e38d850eee4858d33b2f97f54c8b4b669a539081d24a5e0b6ef1ed5152b44cea16f7807194bed73430d1e4a708f4', 1);
EXEC CEMJ_PA_USUARIO_CREAR(3, 3, 'valentina.soto@correo-demo.cl', 'scrypt$bb95d4e36b72b622ed74fa31672cfb75$afddd0bbf30a8ff90c065669754b5f91c2bc8a15353c4a40d0333219d15f06eb251cefcb697173af1362a75f442973b7f4b5127c5d222716d674ba35dc0bfd97', 1);
EXEC CEMJ_PA_USUARIO_CREAR(3, 5, 'francisca.herrera@correo-demo.cl', 'scrypt$dadec4ce3a01d149877af31198af44fe$e2a3b32faad0c78739935b5b762977fa19b1d8521da39dbfa396e9de5f0e6e7c17b83230022754cbf7683101f762c06e12fd519acb41ad2c806f4ede92dc9c71', 1);
EXEC CEMJ_PA_USUARIO_CREAR(3, 8, 'matias.reyes@correo-demo.cl', 'scrypt$19883ed2c7e87a8dc49869a17874f967$e030dc83df89a687563569389c5b53d0d69f6fcbbdd4708c2f2f5fb37f1e762393e7698fe6d5228d73e8d4310ca2af76548dd22ea2e62716c374977984724bea', 1);
EXEC CEMJ_PA_USUARIO_CREAR(3, 10, 'sebastian.vasquez@correo-demo.cl', 'scrypt$dced67f37ef5c019582348418bd194bc$919d26efecda126e8c1523f2dbf5b4e37c62b79bca10cf57632e2fa9ab2b68c19bf5bcb1f6fc9488f7b18698f96774c1af16e47423e3f46840d3e7a7bab6f40c', 1);


-- =====================================================================
-- 3. PRODUCTOS E HISTORIA DE VENTAS (gestores G1-G5)
-- =====================================================================
PROMPT === 3. Productos e historia de ventas (puede tardar 1-2 minutos) ===
DECLARE
    -- Periodo: desde el dia 1 de hace 3 meses hasta hoy
    V_INICIO DATE := ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -3);
    V_HOY    DATE := TRUNC(SYSDATE);
    V_DIA    DATE;

    -- Catalogo en memoria (indice 1..N)
    TYPE T_NUM IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE T_TXT IS TABLE OF VARCHAR2(500) INDEX BY PLS_INTEGER;
    P_ID      T_NUM;   -- ID_PRODUCTO
    P_CAT     T_NUM;
    P_COD     T_TXT;
    P_NOM     T_TXT;
    P_DESC    T_TXT;
    P_FMT     T_TXT;
    P_ANADA   T_NUM;
    P_PRECIO  T_NUM;
    P_MIN     T_NUM;   -- stock minimo
    P_INI     T_NUM;   -- stock inicial
    P_LOTE    T_NUM;   -- botellas por reposicion
    P_PESO    T_NUM;   -- popularidad (0 = no se vende en el periodo)

    -- Indices de productos con papel especial en la demo
    I_CAB      PLS_INTEGER;
    I_MERLOT   PLS_INTEGER;
    I_CARIGNAN PLS_INTEGER;
    I_ROSE     PLS_INTEGER;

    V_ADMIN  NUMBER;
    V_VEND   T_NUM;
    V_NATURAL T_NUM;
    V_EMPRESA T_NUM;
    V_WEB    T_NUM;   -- clientes con cuenta web

    V_CAT_VINO NUMBER;
    V_CAT_UVA  NUMBER;

    V_VENTAS NUMBER := 0;
    V_ANULADAS NUMBER := 0;
    V_SOLICITUDES NUMBER := 0;
    V_ERRORES NUMBER := 0;

    -- ----------------------------------------------------------------
    -- Utilidades
    -- ----------------------------------------------------------------
    FUNCTION AZAR(P_DESDE NUMBER, P_HASTA NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN TRUNC(DBMS_RANDOM.VALUE(P_DESDE, P_HASTA + 1));
    END;

    PROCEDURE ANOTAR_ERROR(P_DONDE VARCHAR2) IS
    BEGIN
        V_ERRORES := V_ERRORES + 1;
        IF V_ERRORES <= 10 THEN
            DBMS_OUTPUT.PUT_LINE('AVISO (' || P_DONDE || '): ' || SQLERRM);
        END IF;
    END;

    FUNCTION ID_CEPA(P_NOMBRE VARCHAR2) RETURN NUMBER IS
        V_ID NUMBER;
    BEGIN
        SELECT ID_CEPA INTO V_ID FROM CEMJ_CEPA WHERE UPPER(NOMBRE) = UPPER(P_NOMBRE);
        RETURN V_ID;
    END;

    FUNCTION STOCK(P_IDX PLS_INTEGER) RETURN NUMBER IS
    BEGIN
        RETURN CEMJ_FN_STOCK_DISPONIBLE(P_ID(P_IDX));
    END;

    -- Hora aleatoria dentro del dia, nunca en el futuro
    FUNCTION HORA(P_DIA DATE, P_DESDE NUMBER, P_HASTA NUMBER) RETURN DATE IS
        V_F DATE;
    BEGIN
        V_F := P_DIA + AZAR(P_DESDE, P_HASTA - 1) / 24 + AZAR(0, 59) / 1440;
        RETURN V_F;
    END;

    -- ----------------------------------------------------------------
    -- Cambio de fechas (los gestores registran SYSDATE)
    -- ----------------------------------------------------------------
    PROCEDURE FECHAR_MOVIMIENTO(P_ID_MOV NUMBER, P_FECHA DATE) IS
    BEGIN
        UPDATE CEMJ_MOVIMIENTO_INVENTARIO SET
            FECHA_CREACION = P_FECHA,
            FECHA_APLICACION = CASE WHEN FECHA_APLICACION IS NOT NULL THEN P_FECHA END
        WHERE ID_MOVIMIENTO = P_ID_MOV;
        COMMIT;
    END;

    PROCEDURE FECHAR_VENTA(P_ID_VENTA NUMBER, P_FECHA DATE) IS
        V_CONF DATE := P_FECHA + 10 / 1440;
    BEGIN
        UPDATE CEMJ_VENTA SET
            FECHA_CREACION = P_FECHA,
            FECHA_CONFIRMACION = V_CONF
        WHERE ID_VENTA = P_ID_VENTA;

        UPDATE CEMJ_PAGO SET FECHA_PAGO = V_CONF WHERE ID_VENTA = P_ID_VENTA;

        UPDATE CEMJ_MOVIMIENTO_INVENTARIO SET
            FECHA_CREACION = V_CONF,
            FECHA_APLICACION = V_CONF
        WHERE ID_VENTA = P_ID_VENTA
        AND TIPO_MOVIMIENTO = 'SALIDA_VENTA';
        COMMIT;
    END;

    PROCEDURE FECHAR_ANULACION(P_ID_VENTA NUMBER, P_FECHA DATE) IS
    BEGIN
        UPDATE CEMJ_VENTA SET FECHA_ANULACION = P_FECHA WHERE ID_VENTA = P_ID_VENTA;

        UPDATE CEMJ_MOVIMIENTO_INVENTARIO SET
            FECHA_CREACION = P_FECHA,
            FECHA_APLICACION = P_FECHA
        WHERE ID_VENTA = P_ID_VENTA
        AND TIPO_MOVIMIENTO = 'REVERSION_VENTA';
        COMMIT;
    END;

    PROCEDURE FECHAR_SOLICITUD(P_ID_SOL NUMBER, P_FECHA DATE) IS
    BEGIN
        UPDATE CEMJ_SOLICITUD_COMPRA SET
            FECHA_CREACION = P_FECHA,
            FECHA_ENVIO = CASE WHEN FECHA_ENVIO IS NOT NULL THEN P_FECHA + 5 / 1440 END,
            FECHA_CIERRE = CASE WHEN FECHA_CIERRE IS NOT NULL THEN P_FECHA + 90 / 1440 END
        WHERE ID_SOLICITUD = P_ID_SOL;
        COMMIT;
    END;

    -- ----------------------------------------------------------------
    -- Catalogo
    -- ----------------------------------------------------------------
    PROCEDURE AGREGAR_PRODUCTO(
        P_CATEGORIA NUMBER, P_CODIGO VARCHAR2, P_NOMBRE VARCHAR2,
        P_DESCRIPCION VARCHAR2, P_FORMATO VARCHAR2, P_ANIO NUMBER,
        P_PRECIO_V NUMBER, P_MINIMO NUMBER, P_INICIAL NUMBER, P_LOTE_V NUMBER,
        P_POPULARIDAD NUMBER,
        P_CEPA1 VARCHAR2, P_PCT1 NUMBER,
        P_CEPA2 VARCHAR2 DEFAULT NULL, P_PCT2 NUMBER DEFAULT NULL,
        P_CEPA3 VARCHAR2 DEFAULT NULL, P_PCT3 NUMBER DEFAULT NULL
    ) IS
        N PLS_INTEGER := P_ID.COUNT + 1;
    BEGIN
        -- Se crea inactivo, se le carga la composicion y se activa
        CEMJ_PA_PRODUCTO_CREAR(P_CATEGORIA, P_CODIGO, P_NOMBRE, P_DESCRIPCION,
            P_FORMATO, P_ANIO, P_PRECIO_V, 0, P_MINIMO);

        P_ID(N) := CEMJ_FN_PRODUCTO_OBTENER_ID(P_CODIGO);
        P_CAT(N) := P_CATEGORIA;   P_COD(N) := UPPER(P_CODIGO);
        P_NOM(N) := P_NOMBRE;      P_DESC(N) := P_DESCRIPCION;
        P_FMT(N) := P_FORMATO;     P_ANADA(N) := P_ANIO;
        P_PRECIO(N) := P_PRECIO_V; P_MIN(N) := P_MINIMO;
        P_INI(N) := P_INICIAL;     P_LOTE(N) := P_LOTE_V;
        P_PESO(N) := P_POPULARIDAD;

        CEMJ_PA_PROD_CEPA_CREAR(P_ID(N), ID_CEPA(P_CEPA1), P_PCT1);
        IF P_CEPA2 IS NOT NULL THEN
            CEMJ_PA_PROD_CEPA_CREAR(P_ID(N), ID_CEPA(P_CEPA2), P_PCT2);
        END IF;
        IF P_CEPA3 IS NOT NULL THEN
            CEMJ_PA_PROD_CEPA_CREAR(P_ID(N), ID_CEPA(P_CEPA3), P_PCT3);
        END IF;

        -- Popularidad 0 = fuera de temporada (uva a granel): queda inactivo
        -- (no esta a la venta; se activa en marzo con la cosecha)
        IF P_POPULARIDAD > 0 THEN
            CEMJ_PA_PRODUCTO_MODIFICAR(P_ID(N), P_CATEGORIA, P_CODIGO, P_NOMBRE,
                P_DESCRIPCION, P_FORMATO, P_ANIO, P_PRECIO_V, 1);
        END IF;
    END;

    -- Popularidad segun la fecha: en el ultimo mes (primavera y fiestas)
    -- suben los blancos y el rose
    FUNCTION PESO(P_IDX PLS_INTEGER, P_DIA DATE) RETURN NUMBER IS
    BEGIN
        IF P_DIA >= ADD_MONTHS(V_INICIO, 3)
           AND (P_COD(P_IDX) LIKE 'VB-%' OR P_COD(P_IDX) LIKE 'VR-%') THEN
            RETURN P_PESO(P_IDX) * 2;
        END IF;
        RETURN P_PESO(P_IDX);
    END;

    FUNCTION PRODUCTO_AL_AZAR(P_DIA DATE) RETURN PLS_INTEGER IS
        V_TOTAL NUMBER := 0;
        V_ACUM  NUMBER := 0;
        V_R     NUMBER;
    BEGIN
        FOR I IN 1 .. P_ID.COUNT LOOP
            V_TOTAL := V_TOTAL + PESO(I, P_DIA);
        END LOOP;
        V_R := DBMS_RANDOM.VALUE(0, V_TOTAL);
        FOR I IN 1 .. P_ID.COUNT LOOP
            V_ACUM := V_ACUM + PESO(I, P_DIA);
            IF PESO(I, P_DIA) > 0 AND V_R < V_ACUM THEN
                RETURN I;
            END IF;
        END LOOP;
        RETURN 1;
    END;

    -- ----------------------------------------------------------------
    -- Inventario (G1)
    -- ----------------------------------------------------------------
    PROCEDURE MOVIMIENTO(P_IDX PLS_INTEGER, P_TIPO VARCHAR2, P_CANT NUMBER,
                         P_MOTIVO VARCHAR2, P_FECHA DATE) IS
        V_MOV NUMBER;
    BEGIN
        IF P_CANT <= 0 THEN
            RETURN;
        END IF;
        CEMJ_PA_MOVIMIENTO_CREAR(P_ID(P_IDX), V_ADMIN, P_TIPO, P_CANT, P_MOTIVO);
        SELECT MAX(ID_MOVIMIENTO) INTO V_MOV FROM CEMJ_MOVIMIENTO_INVENTARIO;
        CEMJ_PA_GES_MOV_APLICAR(V_MOV, V_ADMIN);
        FECHAR_MOVIMIENTO(V_MOV, P_FECHA);
    EXCEPTION
        WHEN OTHERS THEN ANOTAR_ERROR('movimiento ' || P_COD(P_IDX));
    END;

    -- ----------------------------------------------------------------
    -- Venta presencial (G2 + G4, a veces G5)
    -- ----------------------------------------------------------------
    PROCEDURE VENTA_PRESENCIAL(P_FECHA DATE) IS
        V_VENTA   NUMBER;
        V_VENDEDOR NUMBER := V_VEND(AZAR(1, V_VEND.COUNT));
        V_CLIENTE NUMBER;
        V_LUGAR   VARCHAR2(100) := 'Sala de ventas Vina La Alborada';
        V_R       NUMBER := DBMS_RANDOM.VALUE;
        V_LINEAS  NUMBER;
        V_MIN_C   NUMBER;
        V_MAX_C   NUMBER;
        V_METODO  NUMBER;
        V_REF     VARCHAR2(100);
        V_HAY     NUMBER;
    BEGIN
        IF TO_CHAR(P_FECHA, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') IN ('SAT', 'SUN')
           AND DBMS_RANDOM.VALUE < 0.5 THEN
            V_LUGAR := 'Feria Costumbrista de Talca';
        END IF;

        -- Tipo de comprador
        IF V_R < 0.12 THEN
            V_CLIENTE := V_EMPRESA(AZAR(1, V_EMPRESA.COUNT));
            V_LINEAS := AZAR(2, 4); V_MIN_C := 12; V_MAX_C := 36;
            V_METODO := 4;   -- transferencia
        ELSIF V_R < 0.45 THEN
            V_CLIENTE := V_NATURAL(AZAR(1, V_NATURAL.COUNT));
            V_LINEAS := AZAR(1, 3); V_MIN_C := 1; V_MAX_C := 6;
            V_METODO := AZAR(1, 4);
        ELSE
            V_CLIENTE := NULL;   -- comprador de mostrador sin registro
            V_LINEAS := AZAR(1, 2); V_MIN_C := 1; V_MAX_C := 4;
            V_METODO := AZAR(1, 3);
        END IF;

        CEMJ_PA_GES_VENTA_CREAR(V_VENDEDOR, V_CLIENTE, NULL, V_LUGAR, NULL, V_VENTA);

        FOR L IN 1 .. V_LINEAS LOOP
            BEGIN
                CEMJ_PA_GES_VENTA_AGREGAR(V_VENTA, P_ID(PRODUCTO_AL_AZAR(P_FECHA)),
                    AZAR(V_MIN_C, V_MAX_C));
            EXCEPTION
                -- Sin stock suficiente: el cliente lleva otra cosa
                WHEN OTHERS THEN
                    IF SQLCODE <> -20307 THEN ANOTAR_ERROR('agregar'); END IF;
            END;
        END LOOP;

        SELECT COUNT(*) INTO V_HAY FROM CEMJ_DETALLE_VENTA WHERE ID_VENTA = V_VENTA;
        IF V_HAY = 0 THEN
            -- No se pudo vender nada: la venta vacia se descarta
            DELETE FROM CEMJ_VENTA WHERE ID_VENTA = V_VENTA;
            COMMIT;
            RETURN;
        END IF;

        IF V_METODO = 4 THEN
            V_REF := 'TRF-' || TO_CHAR(P_FECHA, 'YYMMDD') || '-' || V_VENTA;
        END IF;
        CEMJ_PA_GES_VENTA_CONFIRMAR(V_VENTA, V_VENDEDOR, V_METODO, V_REF);
        FECHAR_VENTA(V_VENTA, P_FECHA);
        V_VENTAS := V_VENTAS + 1;

        -- Algunas ventas se anulan entre 1 y 48 horas despues
        IF DBMS_RANDOM.VALUE < 0.03 AND P_FECHA + 2 < SYSDATE THEN
            CEMJ_PA_GES_VENTA_ANULAR(V_VENTA, V_ADMIN,
                CASE AZAR(1, 3)
                    WHEN 1 THEN 'Cliente devolvio botellas con corcho danado'
                    WHEN 2 THEN 'Error en el registro: venta duplicada'
                    ELSE 'Cliente se arrepintio de la compra'
                END);
            FECHAR_ANULACION(V_VENTA, P_FECHA + AZAR(1, 48) / 24);
            V_ANULADAS := V_ANULADAS + 1;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN ANOTAR_ERROR('venta presencial');
    END;

    -- ----------------------------------------------------------------
    -- Solicitud web -> venta digital (CRUD solicitud + G3 + G4)
    -- ----------------------------------------------------------------
    PROCEDURE VENTA_WEB(P_FECHA DATE, P_DEJAR_PENDIENTE BOOLEAN DEFAULT FALSE) IS
        V_CLIENTE  NUMBER := V_WEB(AZAR(1, V_WEB.COUNT));
        V_VENDEDOR NUMBER := V_VEND(AZAR(1, V_VEND.COUNT));
        V_SOL      NUMBER;
        V_VENTA    NUMBER;
        V_HAY      NUMBER;
        V_FOLIO    NUMBER;
    BEGIN
        CEMJ_PA_SOLICITUD_CREAR(V_CLIENTE,
            CASE AZAR(1, 4)
                WHEN 1 THEN 'Retiro en la vina el fin de semana'
                WHEN 2 THEN 'Es para un regalo, por favor con caja'
                ELSE NULL
            END);
        SELECT MAX(ID_SOLICITUD) INTO V_SOL FROM CEMJ_SOLICITUD_COMPRA;
        V_SOLICITUDES := V_SOLICITUDES + 1;

        FOR L IN 1 .. AZAR(1, 3) LOOP
            BEGIN
                CEMJ_PA_DET_SOLIC_CREAR(V_SOL, P_ID(PRODUCTO_AL_AZAR(P_FECHA)), AZAR(2, 12));
            EXCEPTION
                WHEN OTHERS THEN NULL;   -- producto repetido: se ignora
            END;
        END LOOP;

        SELECT COUNT(*) INTO V_HAY FROM CEMJ_DETALLE_SOLICITUD WHERE ID_SOLICITUD = V_SOL;
        IF V_HAY = 0 THEN
            CEMJ_PA_SOLICITUD_ELIMINAR(V_SOL);
            FECHAR_SOLICITUD(V_SOL, P_FECHA);
            RETURN;
        END IF;

        CEMJ_PA_GES_SOLIC_ENVIAR(V_SOL);

        IF P_DEJAR_PENDIENTE THEN
            FECHAR_SOLICITUD(V_SOL, P_FECHA);
            RETURN;
        END IF;

        BEGIN
            CEMJ_PA_GES_SOLIC_RESOLVER(V_SOL, V_VENDEDOR,
                CASE WHEN DBMS_RANDOM.VALUE < 0.9 THEN 'ACEPTADA' ELSE 'RECHAZADA' END,
                V_VENTA);
        EXCEPTION
            -- Sin stock para aceptarla: se rechaza
            WHEN OTHERS THEN
                CEMJ_PA_GES_SOLIC_RESOLVER(V_SOL, V_VENDEDOR, 'RECHAZADA', V_VENTA);
        END;
        FECHAR_SOLICITUD(V_SOL, P_FECHA);

        IF V_VENTA IS NOT NULL THEN
            SELECT NUMERO_FOLIO INTO V_FOLIO FROM CEMJ_SOLICITUD_COMPRA WHERE ID_SOLICITUD = V_SOL;
            CEMJ_PA_GES_VENTA_CONFIRMAR(V_VENTA, V_VENDEDOR, 4, 'WEB-' || V_FOLIO);
            FECHAR_VENTA(V_VENTA, P_FECHA + 2 / 24);
            V_VENTAS := V_VENTAS + 1;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN ANOTAR_ERROR('venta web');
    END;

    -- Deja el stock de un producto en un valor exacto (conteo fisico)
    PROCEDURE AJUSTAR_A(P_IDX PLS_INTEGER, P_OBJETIVO NUMBER, P_FECHA DATE) IS
        V_DIF NUMBER := P_OBJETIVO - STOCK(P_IDX);
    BEGIN
        IF V_DIF > 0 THEN
            MOVIMIENTO(P_IDX, 'AJUSTE_POSITIVO', V_DIF, 'Ajuste por inventario fisico', P_FECHA);
        ELSIF V_DIF < 0 THEN
            MOVIMIENTO(P_IDX, 'AJUSTE_NEGATIVO', -V_DIF, 'Ajuste por inventario fisico', P_FECHA);
        END IF;
    END;

BEGIN
    -- Misma semilla = mismos datos cada vez que se ejecuta
    DBMS_RANDOM.SEED(20261121);

    SELECT ID_USUARIO INTO V_ADMIN FROM CEMJ_USUARIO WHERE CORREO = 'ADMIN@ALBORADA.CL';
    SELECT ID_USUARIO BULK COLLECT INTO V_VEND
    FROM CEMJ_USUARIO WHERE ID_ROL = 2 ORDER BY ID_USUARIO;
    SELECT ID_CLIENTE BULK COLLECT INTO V_NATURAL
    FROM CEMJ_CLIENTE WHERE TIPO_CLIENTE = 'NATURAL' ORDER BY ID_CLIENTE;
    SELECT ID_CLIENTE BULK COLLECT INTO V_EMPRESA
    FROM CEMJ_CLIENTE WHERE TIPO_CLIENTE = 'EMPRESA' ORDER BY ID_CLIENTE;
    SELECT ID_CLIENTE BULK COLLECT INTO V_WEB
    FROM CEMJ_USUARIO WHERE ID_CLIENTE IS NOT NULL ORDER BY ID_CLIENTE;
    SELECT ID_CATEGORIA INTO V_CAT_VINO FROM CEMJ_CATEGORIA_PRODUCTO WHERE UPPER(NOMBRE) = 'VINOS';
    SELECT ID_CATEGORIA INTO V_CAT_UVA FROM CEMJ_CATEGORIA_PRODUCTO WHERE UPPER(NOMBRE) = 'UVA';

    -- Catalogo (EJEMPLO): categoria, codigo, nombre, descripcion, formato,
    -- anada, precio, minimo, stock inicial, lote de reposicion,
    -- popularidad, composicion
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-PAI-2024', 'Pais Tradicion 2024',
        'Tinto ligero de vinas de secano', '750 ml', 2024, 6490, 24, 144, 120, 12, 'Pais', 100);
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-CAR-RES-2022', 'Carmenere Reserva 2022',
        'Tinto con notas de pimienta y frutos rojos', '750 ml', 2022, 8990, 36, 240, 120, 22, 'Carmenere', 100);
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-CS-RES-2022', 'Cabernet Sauvignon Reserva 2022',
        'Tinto de guarda con 8 meses en barrica', '750 ml', 2022, 8990, 36, 240, 120, 20, 'Cabernet Sauvignon', 100);
    I_CAB := P_ID.COUNT;
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-MER-2023', 'Merlot Varietal 2023',
        'Tinto suave para todos los dias', '750 ml', 2023, 5990, 24, 180, 120, 14, 'Merlot', 100);
    I_MERLOT := P_ID.COUNT;
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-CGN-GR-2021', 'Carignan Gran Reserva 2021',
        'Vinas viejas de secano, 12 meses en barrica', '750 ml', 2021, 14990, 12, 60, 60, 6, 'Carignan', 85, 'Cabernet Sauvignon', 15);
    I_CARIGNAN := P_ID.COUNT;
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VT-ENS-GR-2021', 'Ensamblaje Alborada Gran Reserva 2021',
        'Ensamblaje insignia de la vina', '750 ml', 2021, 16990, 12, 72, 60, 6, 'Cabernet Sauvignon', 50, 'Carmenere', 30, 'Carignan', 20);
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VB-SB-2024', 'Sauvignon Blanc 2024',
        'Blanco fresco y citrico', '750 ml', 2024, 5990, 24, 180, 120, 10, 'Sauvignon Blanc', 100);
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VB-CH-RES-2023', 'Chardonnay Reserva 2023',
        'Blanco con paso por barrica', '750 ml', 2023, 7990, 24, 144, 120, 7, 'Chardonnay', 100);
    AGREGAR_PRODUCTO(V_CAT_VINO, 'VR-ROSE-2024', 'Rose de Pais 2024',
        'Rosado de Pais, fresco y frutal', '750 ml', 2024, 6990, 24, 144, 120, 8, 'Pais', 100);
    I_ROSE := P_ID.COUNT;
    AGREGAR_PRODUCTO(V_CAT_UVA, 'UVA-PAI', 'Uva Pais a granel',
        'Venta en temporada de cosecha', 'Granel', NULL, 450, 0, 0, 0, 0, 'Pais', 100);
    AGREGAR_PRODUCTO(V_CAT_UVA, 'UVA-CS', 'Uva Cabernet Sauvignon a granel',
        'Venta en temporada de cosecha', 'Granel', NULL, 650, 0, 0, 0, 0, 'Cabernet Sauvignon', 100);
    AGREGAR_PRODUCTO(V_CAT_UVA, 'UVA-CAR', 'Uva Carmenere a granel',
        'Venta en temporada de cosecha', 'Granel', NULL, 700, 0, 0, 0, 0, 'Carmenere', 100);

    -- Fechas de registro de clientes y usuarios: antes del periodo
    UPDATE CEMJ_CLIENTE SET FECHA_REGISTRO = V_INICIO - MOD(ID_CLIENTE * 37, 300) - 10;
    UPDATE CEMJ_USUARIO SET FECHA_REGISTRO = V_INICIO - MOD(ID_USUARIO * 23, 200) - 5;
    COMMIT;

    -- Recorrido dia por dia
    V_DIA := V_INICIO;
    WHILE V_DIA <= V_HOY LOOP

        -- Stock inicial el primer dia
        IF V_DIA = V_INICIO THEN
            FOR I IN 1 .. P_ID.COUNT LOOP
                MOVIMIENTO(I, 'ENTRADA', P_INI(I), 'Stock inicial desde bodega de guarda',
                    V_DIA + 8 / 24);
            END LOOP;
        END IF;

        -- Reposicion lunes y jueves cuando el stock baja de 3 veces el minimo.
        -- El Carignan deja de reponerse 5 semanas antes (queda bajo el
        -- minimo) y el Rose 3 semanas antes (se deja justo sobre el minimo).
        IF TO_CHAR(V_DIA, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') IN ('MON', 'THU')
           AND V_DIA > V_INICIO THEN
            FOR I IN 1 .. P_ID.COUNT LOOP
                IF P_PESO(I) > 0 AND STOCK(I) < P_MIN(I) * 3
                   AND NOT (I = I_CARIGNAN AND V_DIA > V_HOY - 35)
                   AND NOT (I = I_ROSE AND V_DIA > V_HOY - 21) THEN
                    MOVIMIENTO(I, 'ENTRADA', P_LOTE(I), 'Ingreso desde bodega de guarda',
                        V_DIA + 8 / 24 + 30 / 1440);
                END IF;
            END LOOP;
        END IF;

        -- Merma en el segundo mes
        IF V_DIA = V_INICIO + 40 THEN
            MOVIMIENTO(I_MERLOT, 'AJUSTE_NEGATIVO', 6, 'Botellas quebradas en traslado',
                V_DIA + 9 / 24);
        END IF;

        -- Cambio de precio al comenzar el tercer mes
        IF V_DIA = ADD_MONTHS(V_INICIO, 2) THEN
            CEMJ_PA_PRODUCTO_MODIFICAR(P_ID(I_CAB), P_CAT(I_CAB), P_COD(I_CAB), P_NOM(I_CAB),
                P_DESC(I_CAB), P_FMT(I_CAB), P_ANADA(I_CAB), 9490, 1);
        END IF;

        -- Ventas presenciales: mas los fines de semana y en el mes actual
        FOR V IN 1 .. CASE
                WHEN TO_CHAR(V_DIA, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') IN ('SAT', 'SUN')
                    THEN AZAR(2, 5)
                ELSE AZAR(0, 3)
            END + CASE WHEN V_DIA >= ADD_MONTHS(V_INICIO, 3) THEN AZAR(0, 1) ELSE 0 END
        LOOP
            DECLARE
                V_F DATE := HORA(V_DIA, 10, 19);
            BEGIN
                IF V_F < SYSDATE - 15 / 1440 THEN
                    VENTA_PRESENCIAL(V_F);
                END IF;
            END;
        END LOOP;

        -- Solicitudes web: las de ayer y hoy quedan PENDIENTES para la demo
        IF V_DIA >= V_HOY - 1 THEN
            IF HORA(V_DIA, 8, 9) < SYSDATE THEN
                VENTA_WEB(LEAST(HORA(V_DIA, 8, 9), SYSDATE - 5 / 1440), TRUE);
            END IF;
        ELSIF DBMS_RANDOM.VALUE < 0.35 THEN
            VENTA_WEB(HORA(V_DIA, 9, 18));
        END IF;

        V_DIA := V_DIA + 1;
    END LOOP;

    -- Conteo fisico al cierre: deja el estado buscado para la demo
    AJUSTAR_A(I_CARIGNAN, P_MIN(I_CARIGNAN) - 4, LEAST(V_HOY + 8 / 24, SYSDATE - 2 / 1440));
    AJUSTAR_A(I_ROSE, P_MIN(I_ROSE) + 6, LEAST(V_HOY + 8 / 24, SYSDATE - 2 / 1440));

    DBMS_OUTPUT.PUT_LINE('Periodo: ' || TO_CHAR(V_INICIO, 'DD-MM-YYYY') || ' a '
        || TO_CHAR(V_HOY, 'DD-MM-YYYY'));
    DBMS_OUTPUT.PUT_LINE('Ventas confirmadas: ' || V_VENTAS || ' (anuladas despues: '
        || V_ANULADAS || '), solicitudes web: ' || V_SOLICITUDES);
    DBMS_OUTPUT.PUT_LINE('Avisos inesperados: ' || V_ERRORES || ' (deberia ser 0)');
END;
/


-- =====================================================================
-- 4. FIN DE LA CARGA: se reactivan los triggers de auditoria
-- =====================================================================
PROMPT === 4. Reactivando triggers de auditoria ===
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_USUARIO_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_CLIENTE_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PRODUCTO_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_VENTA_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_PAGO_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_INSERT ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_UPDATE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_AUD_MOVIMIENTO_DELETE ENABLE;
ALTER TRIGGER CEMJ_TRIGGER_INVENTARIO_ALERTA ENABLE;

PROMPT -- Esperado: los 19 triggers ENABLED
SELECT TRIGGER_NAME, STATUS FROM USER_TRIGGERS
WHERE TRIGGER_NAME LIKE 'CEMJ\_TRIGGER\_AUD\_%' ESCAPE '\'
OR TRIGGER_NAME = 'CEMJ_TRIGGER_INVENTARIO_ALERTA'
ORDER BY TRIGGER_NAME;


-- =====================================================================
-- 5. RESUMEN DE LO CARGADO
-- =====================================================================
PROMPT === 5. Resumen ===
PROMPT -- Ventas por mes y canal
SELECT TO_CHAR(FECHA_CONFIRMACION, 'YYYY-MM') AS MES, CANAL_VENTA,
       SUM(CASE WHEN ESTADO = 'CONFIRMADA' THEN 1 ELSE 0 END) AS CONFIRMADAS,
       SUM(CASE WHEN ESTADO = 'ANULADA' THEN 1 ELSE 0 END) AS ANULADAS
FROM CEMJ_VENTA
WHERE FECHA_CONFIRMACION IS NOT NULL
GROUP BY TO_CHAR(FECHA_CONFIRMACION, 'YYYY-MM'), CANAL_VENTA
ORDER BY MES, CANAL_VENTA;

PROMPT -- Stock final (Carignan bajo el minimo, Rose justo sobre el minimo)
SELECT P.CODIGO, P.NOMBRE, I.STOCK_ACTUAL, I.STOCK_MINIMO,
       CASE WHEN I.STOCK_ACTUAL < I.STOCK_MINIMO THEN 'BAJO MINIMO' ELSE 'OK' END AS ESTADO
FROM CEMJ_INVENTARIO I
JOIN CEMJ_PRODUCTO P ON P.ID_PRODUCTO = I.ID_PRODUCTO
ORDER BY P.ID_PRODUCTO;

PROMPT -- Solicitudes por estado (2 PENDIENTES para la demo)
SELECT ESTADO, COUNT(*) AS CANTIDAD
FROM CEMJ_SOLICITUD_COMPRA
GROUP BY ESTADO
ORDER BY ESTADO;

PROMPT -- Auditoria: deberia estar vacia (la carga historica no se audita)
SELECT COUNT(*) AS FILAS_AUDITORIA FROM CEMJ_AUDITORIA;
