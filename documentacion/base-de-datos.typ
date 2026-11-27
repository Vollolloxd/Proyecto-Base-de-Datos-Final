#set document(title: "Base de datos de Viña La Alborada")
#set page(paper: "a4", margin: (x: 22mm, y: 21mm), numbering: "1")
#set text(lang: "es", size: 10pt)
#set par(justify: true)
#set heading(numbering: "1.1")
#show heading.where(level: 1): set text(fill: rgb("#68283e"))
#align(center)[#text(25pt, weight: "bold", fill: rgb("#68283e"))[Viña La Alborada] \
  #text(15pt)[Base de datos Oracle y guía de defensa]]
#outline(depth: 2)

= Instalación y alcance
`DB/script.sql` reconstruye el esquema Oracle. En orden, elimina objetos previos, crea 17 tablas y dos secuencias, instala los triggers de validación, instala los mantenedores y termina con auditoría, acceso, gestores transaccionales e informes. Ejecutar como script en SQLcl, SQL*Plus o SQL Developer (F5), con el usuario del esquema en la PDB configurada. Los `DROP` iniciales pueden informar objetos inexistentes en un esquema nuevo. En un esquema con datos, los `DROP TABLE … PURGE` destruyen su contenido. Para la demo, usar un esquema descartable y luego cargar `DB/DATOS_DEMO.sql` una vez, sobre el esquema recién instalado.

```sql
@DB/script.sql
SELECT object_name, object_type, status
FROM user_objects
WHERE object_name LIKE 'CEMJ\_%' ESCAPE '\'
  AND status <> 'VALID';
SELECT name, type, line, position, text
FROM user_errors
WHERE name LIKE 'CEMJ\_%' ESCAPE '\'
  AND attribute = 'ERROR'
ORDER BY name, type, sequence;
@DB/DATOS_DEMO.sql
```

El DDL usa PK para identidad, FK para integridad referencial y UNIQUE para evitar duplicados. Los triggers de fila completan defaults y comprueban invariantes. Los procedimientos aplican reglas de estado y coordinan varias tablas. Se usan `%TYPE` para anclar tipos al esquema, parámetros OUT para IDs o resultados y `SYS_REFCURSOR` para listados. El anexo incluye las columnas, tipos y restricciones declaradas en cada tabla.

== Relaciones y cardinalidad
- Rol 1:N Usuario. Cliente 0:1 Usuario asociado gracias a `UNIQUE(ID_CLIENTE)` en Usuario. Un cliente puede comprar presencialmente sin tener una cuenta web.
- Categoría 1:N Producto. Producto N:M Cepa por Producto_Cepa, cuya PK compuesta impide duplicar una variedad en la misma ficha. Producto 1:0..1 Inventario por PK que también es FK. El mantenedor de producto crea el inventario asociado.
- Cliente 1:N Solicitud. Solicitud 1:N Detalle de solicitud; puede estar vacía en borrador. Solicitud 1:0..1 Venta digital por unicidad de `VENTA.ID_SOLICITUD`. La venta presencial puede referenciar un cliente o guardar un nombre libre. En la digital el comprador se deriva de la solicitud.
- Venta 1:N Detalle de venta y 1:0..1 Pago. Método de pago 1:N Pago. Solicitud 1:0..1 Pago de solicitud (método que elige el cliente web) por unicidad de `PAGO_SOLICITUD.ID_SOLICITUD`. Método de pago 1:N Pago de solicitud. Cada detalle usa la PK compuesta cabecera–producto y conserva el precio unitario de la operación.
- Producto, usuario y, cuando corresponda, venta vinculan los movimientos de inventario. Una reversión apunta a su salida mediante la FK autorreferente única `ID_MOVIMIENTO_ORIGEN`. Los folios de solicitudes y movimientos se generan con secuencias independientes y pueden tener saltos.
- Auditoría conserva identificador del registro, operación, detalle, usuario de aplicación, usuario Oracle, equipo y fecha. El identificador auditado es texto y conserva referencias históricas incluso cuando se elimina una fila.

= CRUD y mantenedores
Los nombres de familias siguientes omiten el prefijo `CEMJ_PA_`. Las lecturas devuelven cursores y algunos mantenedores filtran por activos. La eliminación puede ser una baja lógica, una anulación de estado o un borrado físico de una línea.

#table(columns: (1.15fr, 1.35fr, 2.8fr), inset: 5pt, align: left,
  table.header([Familia], [Operaciones], [Reglas y efectos]),
  [`CATEGORIA`], [Crear, listar, modificar, eliminar, reactivar], [Botella o kg. Con productos asociados, la unidad no se puede cambiar. Con productos activos, el maestro no se puede dar de baja.],
  [`CEPA`], [Crear, listar, modificar, eliminar, reactivar], [Baja lógica bloqueada si la usa un producto activo.],
  [`CLIENTE`], [Crear, listar, modificar, eliminar, reactivar], [Natural con nombre y dos apellidos. Empresa con RUT y razón social. El RUT informado es único. Las solicitudes pendientes bloquean la baja lógica.],
  [`USUARIO`], [Crear, listar, modificar, eliminar], [Correo único, rol, cliente asociado según el flujo de aplicación y hash de contraseña. Eliminar fija ACTIVO en 0. El procedimiento de cambio de clave es independiente.],
  [`ROL`], [Listar], [Maestro de perfiles. La carga demo inserta los tres roles.],
  [`METODO_PAGO`], [Crear, listar, modificar, eliminar], [Nombre único y baja lógica. El registro de un nuevo pago exige un método activo.],
  [`PRODUCTO`], [Crear, listar, modificar, eliminar], [Código único. Se crea inactivo y con stock 0. La activación exige una composición de 100% con cepas activas. Eliminar desactiva.],
  [`PROD_CEPA`], [Crear, listar, modificar, eliminar], [Se edita con el producto inactivo. Eliminar borra la relación. El trigger comprueba que cada porcentaje sea mayor que cero y como máximo 100.],
  [`SOLICITUD`], [Crear, listar, modificar, eliminar], [Alta en borrador. Modificar y anular por CRUD exigen borrador. El listado puede limitarse al cliente y presenta total y venta asociada.],
  [`DET_SOLIC`], [Crear, listar, modificar, eliminar], [Solo se escribe en borrador. Se usa el precio vigente al agregar y se refresca al enviar. Quitar borra la línea.],
  [`MOVIMIENTO`], [Crear, listar, modificar, eliminar], [Solo entrada y ajustes manuales. El borrador admite edición o anulación. Aplicar usa un gestor aparte.],
)

El catálogo público se construye con `CEMJ_PA_CATALOGO_LISTAR` y el ranking de destacados. El inventario se consulta junto a los productos y se modifica mediante gestores. La venta y su detalle se crean y consultan por gestores. El pago se genera al confirmar y la auditoría se consulta por listados específicos.

= Reglas de los triggers
== Identidad y normalización
Las funciones `CEMJ_FN_PK_*` calculan el siguiente ID con el máximo existente más uno. Los triggers de ID son compuestos. Calculan el siguiente valor antes de la sentencia y lo asignan por fila cuando el ID viene nulo, incrementando el contador para inserciones múltiples. Distintos procedimientos bloquean la tabla para coordinar la asignación. Los folios son independientes de esas PK y se generan con `NEXTVAL`. Los triggers MAYUS normalizan los campos de identificación y texto indicados por cada entidad con mayúsculas y recorte. Rol, cliente, usuario, categoría, cepa, producto y método de pago validan el indicador ACTIVO como 0 o 1.

== Integridad de las operaciones
- Cliente valida campos mutuamente excluyentes de persona y empresa. Categoría admite `BOTELLA` o `KG`. Producto exige precio positivo y añada opcional entre 1900 y el año de `SYSDATE`, inclusive. Los triggers `CEMJ_TRIGGER_PRODUCTO_INSERT` y `CEMJ_TRIGGER_PRODUCTO_UPDATE` validan el rango al insertar y actualizar, respectivamente. Si el valor queda fuera del rango, Oracle devuelve `ORA-20207`. En 2026 admite 2026 y rechaza 2027. El formulario web calcula su máximo con el año en curso en `America/Santiago`.
- Inventario impide stock actual o mínimo negativos. Los detalles exigen cantidad y precio unitario positivos. Pago exige monto positivo.
- Solicitud distingue `BORRADOR`, `PENDIENTE`, `ACEPTADA`, `RECHAZADA` y `ANULADA`. Valida envío, cierre, usuario de cierre y orden cronológico según el estado. El cambio a anulada está reservado al borrador.
- Venta deriva `DIGITAL` si tiene solicitud y `PRESENCIAL` en caso contrario. La presencial requiere lugar y admite cliente registrado o nombre libre. La digital obtiene los datos del comprador desde la solicitud. Los estados `BORRADOR`, `CONFIRMADA` y `ANULADA` exigen campos de confirmación y anulación coherentes.
- Movimiento valida cantidad positiva, motivo para ajustes, fecha de aplicación y vínculos de venta. Una salida requiere venta y estado aplicado. Una reversión requiere venta, origen y estado aplicado. La anulación solo parte de borrador.
- Auditoría valida el tipo de evento, completa datos de contexto y bloquea UPDATE y DELETE. Los triggers DML auditan altas, modificaciones y borrados de usuarios, clientes, productos, ventas, pagos y movimientos. Al modificar, registran los cambios definidos por entidad. El trigger de inventario registra `ALERTA_STOCK` al cruzar por debajo del mínimo y `STOCK_REPUESTO` al volver al mínimo o superarlo si había una alerta abierta. La consulta de productos bajo mínimo compara los valores actuales.

= Flujos transaccionales
== Acceso y registro
React llama a Express. El backend consulta `CEMJ_PA_LOGIN_DATOS`, compara el hash scrypt y registra el resultado con `CEMJ_PA_LOGIN_RESULTADO`. La auditoría de login es una transacción autónoma. Oracle bloquea si acumula cinco fallos de credenciales en los últimos 15 minutos posteriores al último éxito, si existe. Express entrega un JWT y vuelve a consultar permisos Oracle al acceder a módulos. El backend asigna el identificador de sesión Oracle para atribuir cambios al usuario de aplicación. El cliente se registra con `CEMJ_PA_REGISTRAR_CLIENTE`, que comprueba duplicados y crea la ficha y el usuario asociado con rol CLIENTE en la misma transacción. El cambio de contraseña valida la anterior en la aplicación y persiste el nuevo hash.

== Publicación y stock inicial
+ *Maestros.* El alta parte de una categoría y cepas activas. La categoría define si el inventario se mide en botellas o kilos. El formato de venta, por ejemplo 750 ml, describe la presentación.
+ *Ficha e inventario.* «Guardar y activar» valida la composición en el backend y crea la ficha inactiva mediante `CEMJ_PA_PRODUCTO_CREAR`. Este procedimiento crea también la fila de inventario con stock actual cero y el mínimo informado.
+ *Composición y publicación.* El backend recupera el ID por código, guarda las relaciones de cepas con `CEMJ_PA_PROD_CEPA_CREAR` y activa mediante `CEMJ_PA_PRODUCTO_MODIFICAR`. La activación exige cepas activas con porcentajes que sumen 100%. Cada llamada de escritura confirma sus cambios. Si falla un paso posterior al alta, la ficha puede quedar inactiva con una composición parcial. Buscar por código y corregir las filas faltantes antes de activar.
+ *Disponibilidad.* La entrada manual primero queda en borrador. Al aplicar G1 se actualizan inventario y movimiento en la misma transacción. Con 36 botellas de entrada y un mínimo de 12, el resultado esperado es stock actual 36, mínimo 12 y un movimiento aplicado por 36. El catálogo presenta las fichas activas y usa el stock actual para mostrar disponibilidad.

Para seguir el recorrido en la interfaz, consulta la sección «Cargar un producto y dejarlo disponible en la tienda» del manual de usuario. Estas consultas de solo lectura permiten comprobar el resultado. Sustituye el código si usaste otro.

```sql
SELECT p.codigo, p.anada, p.activo, i.stock_actual, i.stock_minimo,
       (SELECT SUM(pc.porcentaje) FROM cemj_producto_cepa pc
        WHERE pc.id_producto = p.id_producto) AS total_cepas
FROM cemj_producto p JOIN cemj_inventario i ON i.id_producto = p.id_producto
WHERE p.codigo = 'VT-ENS-DEMO-2026';

SELECT m.numero_folio, m.tipo_movimiento, m.cantidad, m.estado
FROM cemj_movimiento_inventario m
JOIN cemj_producto p ON p.id_producto = m.id_producto
WHERE p.codigo = 'VT-ENS-DEMO-2026'
ORDER BY m.numero_folio DESC;
```

== G1 · Inventario
Crear entrada o ajuste → `BORRADOR` → `CEMJ_PA_GES_MOV_APLICAR` → `APLICADO`. El gestor valida personal activo, bloquea las filas de movimiento y stock, suma entrada o ajuste positivo, y resta ajuste negativo si el saldo alcanza. Actualiza fecha de aplicación y confirma ambos cambios juntos. Anular un borrador conserva el registro y deja el stock igual.

== G2, G4 y G5 · Venta presencial y anulación
+ `CEMJ_PA_GES_VENTA_CREAR` crea el borrador e identifica al vendedor. `CEMJ_PA_GES_VENTA_AGREGAR` usa el precio vigente y verifica stock para la cantidad acumulada del producto. El borrador no reserva existencias.
+ `CEMJ_PA_GES_VENTA_CONFIRMAR` exige personal, borrador con líneas y método activo. Bloquea venta e inventario para revalidar disponibilidad, descuenta stock y crea una `SALIDA_VENTA` aplicada por cada línea. Actualiza estado y fecha a `CONFIRMADA` e inserta un pago por la suma de cantidad por precio unitario. La misma transacción cubre venta, pago, inventario, movimientos y su auditoría DML.
+ `CEMJ_PA_GES_VENTA_ANULAR` exige una venta confirmada y motivo. Devuelve las cantidades de las salidas aplicadas, crea `REVERSION_VENTA` por cada salida y marca `ANULADA` con fecha, responsable y motivo. El pago histórico queda registrado. El flujo no ejecuta un reembolso bancario.

== G3 · Pedido web y venta digital
+ El catálogo crea o reutiliza una solicitud `BORRADOR`. Se agregan líneas con cantidad y precio. Backend verifica que el solicitante sea el propietario para operar sobre su pedido.
+ El cliente elige método activo. La web tramita por producto. Si el borrador tiene más líneas, el backend separa la elegida en otra solicitud y mantiene las restantes en el borrador. `CEMJ_PA_GES_SOLIC_ENVIAR` exige al menos una línea, comprueba que los productos sigan activos, refresca precios y marca `PENDIENTE`. Enviar no descuenta stock.
+ En Oracle, `CEMJ_PA_GES_SOLIC_RESOLVER` procesa pendientes. Si acepta, verifica disponibilidad y genera una venta digital en borrador con la copia del detalle y precios. Si rechaza, cierra sin venta. Ambos resultados registran responsable y fecha. Confirmar esa venta en Oracle usa G4.
+ En la web actual, el panel permite anular una solicitud en borrador o pendiente. Una pendiente se cierra como `RECHAZADA`. El panel no expone una acción para aceptar y la API de confirmación atiende ventas presenciales. El método web se guarda en Oracle con `CEMJ_PA_PAGO_SOLICITUD_REGISTRAR`, que crea o actualiza la fila de `CEMJ_PAGO_SOLICITUD` (una por solicitud, con un `ID_TRANSACCION` generado con `SYS_GUID` que no cambia aunque el cliente cambie de método). Elegirlo no crea una fila en `CEMJ_PAGO` ni cobra dinero. El rechazo de una pendiente usa `CEMJ_PA_SOLICITUD_RECHAZAR`, que exige un motivo de 1 a 500 caracteres, lo guarda en `CEMJ_SOLICITUD_COMPRA.MOTIVO_RECHAZO` y cierra la solicitud con el gestor de resolución en la misma transacción. La transacción web se muestra solo cuando la venta está confirmada o anulada.

Los gestores de escritura hacen `COMMIT` al finalizar y `ROLLBACK` ante errores. Los bloqueos `FOR UPDATE` protegen filas que se van a cambiar y los bloqueos de tabla aparecen, entre otros puntos, al asignar IDs. La auditoría DML participa en la operación que la generó. El login autónomo y la selección de pago en archivos tienen sus propios límites de persistencia.

= Reportes y recorrido de defensa
- *R1 · Ranking mensual.* `CEMJ_PA_REP_RANKING_PRODUCTOS` agrega cantidades y montos sobre ventas confirmadas en el mes, calcula participaciones y posiciones de más y menos vendidos. `CEMJ_PA_REP_MAS_VENDIDOS` presenta destacados activos con ventas, por defecto los tres primeros de los últimos 30 días.
- *R2 · Canales.* `CEMJ_PA_REP_VENTAS_CANAL` usa el año para mostrar confirmadas, anuladas, montos, ticket medio y participación por canal, junto al total mensual. Las anulaciones se cuentan y quedan fuera de los montos de confirmadas.
- *R3 · Reposición.* `CEMJ_PA_REP_STOCK_CRITICO` cruza productos activos, stock y demanda de ventas confirmadas. Promedio diario = vendidas / días del período. Cobertura = stock / promedio diario cuando hay demanda. Ordena primero sin stock, luego bajo mínimo, luego cobertura inferior a siete días, y después OK. Reposición sugerida = máximo entre cero y mínimo más vendidas menos stock actual.
- *Demostración.* Mostrar categoría, producto, cepas y stock. Vender con la cuenta de vendedor y comparar stock antes y después, pago y salida. Anular con motivo y verificar reversión y stock restituido. Desde la cuenta cliente, enviar un pedido y buscar su folio como vendedor. Desde administrador, revisar auditoría y reportes. Los datos demo incluyen historial relativo a la fecha de carga, ejemplos de solicitudes y productos con stock bajo o cercano al mínimo.

== Consultas para mostrar las evidencias
```sql
SELECT id_venta, id_solicitud, canal_venta, estado
FROM cemj_venta WHERE id_venta = :id_venta;
SELECT monto, id_metodo_pago, referencia
FROM cemj_pago WHERE id_venta = :id_venta;
SELECT numero_folio, id_producto, tipo_movimiento,
       cantidad, estado, id_movimiento_origen
FROM cemj_movimiento_inventario
WHERE id_venta = :id_venta ORDER BY numero_folio;
SELECT nombre_tabla, operacion, id_registro, usuario_app, fecha
FROM cemj_auditoria ORDER BY fecha DESC, id_auditoria DESC
FETCH FIRST 20 ROWS ONLY;
```

== Completar una venta digital en la base de demostración
Elegir el ID de una solicitud pendiente por su folio, el ID de un administrador o vendedor activo y el ID de un método activo. El método se pasa explícitamente porque el gestor Oracle lee el ID recibido y la selección de la web vive en el backend. Ejecutar como script en SQLcl o SQL*Plus y sustituir los valores solicitados. Cada gestor confirma su propia transacción. Si la confirmación falla después de la aceptación, conservar el ID de venta y reintentar solo la confirmación una vez corregida la causa.

```sql
SELECT id_solicitud, numero_folio
FROM cemj_solicitud_compra WHERE estado = 'PENDIENTE';
SELECT u.id_usuario, u.correo
FROM cemj_usuario u JOIN cemj_rol r ON r.id_rol = u.id_rol
WHERE u.activo = 1 AND r.activo = 1
  AND r.nombre IN ('ADMINISTRADOR', 'VENDEDOR');
SELECT id_metodo_pago, nombre
FROM cemj_metodo_pago WHERE activo = 1;

SET DEFINE ON
ACCEPT id_solicitud NUMBER PROMPT 'ID de solicitud pendiente: '
ACCEPT id_personal NUMBER PROMPT 'ID de usuario del personal: '
ACCEPT id_metodo NUMBER PROMPT 'ID del metodo de pago activo: '
VARIABLE id_venta NUMBER
EXEC CEMJ_PA_GES_SOLIC_RESOLVER(&id_solicitud, &id_personal, 'ACEPTADA', :id_venta)
PRINT id_venta
EXEC CEMJ_PA_GES_VENTA_CONFIRMAR(:id_venta, &id_personal, &id_metodo, 'DEMO-WEB-' || :id_venta)
```

#pagebreak()
= Anexo · Diccionario de datos
Cada definición conserva columnas, tipos, nulabilidad, claves y restricciones declaradas. Las reglas de los triggers y procedimientos amplían estas definiciones.

== Tablas
=== #raw("CEMJ_ROL")
Línea 228 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_ROL(
    ID_ROL NUMBER NOT NULL,
    NOMBRE VARCHAR2(30) NOT NULL,
    DESCRIPCION VARCHAR2(200),
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_ROL PRIMARY KEY(ID_ROL),
    CONSTRAINT CEMJ_UQ_ROL_NOMBRE UNIQUE(NOMBRE)
);
```

=== #raw("CEMJ_CLIENTE")
Línea 238 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_CLIENTE(
    ID_CLIENTE NUMBER NOT NULL,
    TIPO_CLIENTE VARCHAR2(10) NOT NULL,
    RUT VARCHAR2(12),
    NOMBRE VARCHAR2(100),
    APELLIDO1 VARCHAR2(100),
    APELLIDO2 VARCHAR2(100),
    RAZON_SOCIAL VARCHAR2(150),
    TELEFONO VARCHAR2(20),
    CORREO VARCHAR2(150),
    FECHA_REGISTRO DATE NOT NULL,
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_CLIENTE PRIMARY KEY(ID_CLIENTE),
    CONSTRAINT CEMJ_UQ_CLIENTE_RUT UNIQUE(RUT)
);
```

=== #raw("CEMJ_USUARIO")
Línea 255 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_USUARIO(
    ID_USUARIO NUMBER NOT NULL,
    ID_ROL NUMBER NOT NULL,
    ID_CLIENTE NUMBER,
    CORREO VARCHAR2(150) NOT NULL,
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    ACTIVO NUMBER NOT NULL,
    FECHA_REGISTRO DATE NOT NULL,
    CONSTRAINT CEMJ_PK_USUARIO PRIMARY KEY(ID_USUARIO),
    CONSTRAINT CEMJ_FK_USUARIO_ROL FOREIGN KEY(ID_ROL) REFERENCES CEMJ_ROL(ID_ROL),
    CONSTRAINT CEMJ_FK_USUARIO_CLIENTE FOREIGN KEY(ID_CLIENTE) REFERENCES CEMJ_CLIENTE(ID_CLIENTE),
    CONSTRAINT CEMJ_UQ_USUARIO_CLIENTE UNIQUE(ID_CLIENTE),
    CONSTRAINT CEMJ_UQ_USUARIO_CORREO UNIQUE(CORREO)
);
```

=== #raw("CEMJ_CATEGORIA_PRODUCTO")
Línea 271 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_CATEGORIA_PRODUCTO(
    ID_CATEGORIA NUMBER NOT NULL,
    NOMBRE VARCHAR2(50) NOT NULL,
    DESCRIPCION VARCHAR2(200),
    UNIDAD_MEDIDA VARCHAR2(15) NOT NULL,
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_CATEGORIA_PRODUCTO PRIMARY KEY(ID_CATEGORIA),
    CONSTRAINT CEMJ_UQ_CATEGORIA_PRODUCTO_NOMBRE UNIQUE(NOMBRE)
);
```

=== #raw("CEMJ_CEPA")
Línea 282 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_CEPA(
    ID_CEPA NUMBER NOT NULL,
    NOMBRE VARCHAR2(100) NOT NULL,
    DESCRIPCION VARCHAR2(300),
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_CEPA PRIMARY KEY(ID_CEPA),
    CONSTRAINT CEMJ_UQ_CEPA_NOMBRE UNIQUE(NOMBRE)
);
```

=== #raw("CEMJ_PRODUCTO")
Línea 292 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_PRODUCTO(
    ID_PRODUCTO NUMBER NOT NULL,
    ID_CATEGORIA NUMBER NOT NULL,
    CODIGO VARCHAR2(30) NOT NULL,
    NOMBRE VARCHAR2(150) NOT NULL,
    DESCRIPCION VARCHAR2(500),
    FORMATO VARCHAR2(50) NOT NULL,
    ANADA NUMBER,
    PRECIO_ACTUAL NUMBER NOT NULL,
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_PRODUCTO PRIMARY KEY(ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_PRODUCTO_CATEGORIA_PRODUCTO FOREIGN KEY(ID_CATEGORIA)
        REFERENCES CEMJ_CATEGORIA_PRODUCTO(ID_CATEGORIA),
    CONSTRAINT CEMJ_UQ_PRODUCTO_CODIGO UNIQUE(CODIGO)
);
```

=== #raw("CEMJ_PRODUCTO_CEPA")
Línea 308 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_PRODUCTO_CEPA(
    ID_PRODUCTO NUMBER NOT NULL,
    ID_CEPA NUMBER NOT NULL,
    PORCENTAJE NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_PRODUCTO_CEPA PRIMARY KEY(ID_PRODUCTO, ID_CEPA),
    CONSTRAINT CEMJ_FK_PRODUCTO_CEPA_PRODUCTO FOREIGN KEY(ID_PRODUCTO) REFERENCES CEMJ_PRODUCTO(ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_PRODUCTO_CEPA_CEPA FOREIGN KEY(ID_CEPA) REFERENCES CEMJ_CEPA(ID_CEPA)
);
```

=== #raw("CEMJ_INVENTARIO")
Línea 317 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_INVENTARIO(
    ID_PRODUCTO NUMBER NOT NULL,
    STOCK_ACTUAL NUMBER NOT NULL,
    STOCK_MINIMO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_INVENTARIO PRIMARY KEY(ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_INVENTARIO_PRODUCTO FOREIGN KEY(ID_PRODUCTO) REFERENCES CEMJ_PRODUCTO(ID_PRODUCTO)
);
```

=== #raw("CEMJ_SOLICITUD_COMPRA")
Línea 325 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_SOLICITUD_COMPRA(
    ID_SOLICITUD NUMBER NOT NULL,
    NUMERO_FOLIO NUMBER NOT NULL,
    ID_CLIENTE NUMBER NOT NULL,
    FECHA_CREACION DATE NOT NULL,
    FECHA_ENVIO DATE,
    ESTADO VARCHAR2(12) NOT NULL,
    OBSERVACIONES VARCHAR2(500),
    ID_USUARIO_CIERRE NUMBER,
    FECHA_CIERRE DATE,
    MOTIVO_RECHAZO VARCHAR2(500),
    CONSTRAINT CEMJ_PK_SOLICITUD_COMPRA PRIMARY KEY(ID_SOLICITUD),
    CONSTRAINT CEMJ_UQ_SOLICITUD_COMPRA_NUMERO_FOLIO UNIQUE(NUMERO_FOLIO),
    CONSTRAINT CEMJ_FK_SOLICITUD_COMPRA_CLIENTE FOREIGN KEY(ID_CLIENTE) REFERENCES CEMJ_CLIENTE(ID_CLIENTE),
    CONSTRAINT CEMJ_FK_SOLICITUD_COMPRA_USUARIO FOREIGN KEY(ID_USUARIO_CIERRE)
        REFERENCES CEMJ_USUARIO(ID_USUARIO)
);
```

=== #raw("CEMJ_DETALLE_SOLICITUD")
Línea 342 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_DETALLE_SOLICITUD(
    ID_SOLICITUD NUMBER NOT NULL,
    ID_PRODUCTO NUMBER NOT NULL,
    CANTIDAD NUMBER NOT NULL,
    PRECIO_UNITARIO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_DETALLE_SOLICITUD PRIMARY KEY(ID_SOLICITUD, ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_DETALLE_SOLICITUD_SOLICITUD_COMPRA FOREIGN KEY(ID_SOLICITUD)
        REFERENCES CEMJ_SOLICITUD_COMPRA(ID_SOLICITUD),
    CONSTRAINT CEMJ_FK_DETALLE_SOLICITUD_PRODUCTO FOREIGN KEY(ID_PRODUCTO)
        REFERENCES CEMJ_PRODUCTO(ID_PRODUCTO)
);
```

=== #raw("CEMJ_VENTA")
Línea 354 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_VENTA(
    ID_VENTA NUMBER NOT NULL,
    ID_SOLICITUD NUMBER,
    ID_CLIENTE NUMBER,
    ID_USUARIO NUMBER NOT NULL,
    CANAL_VENTA VARCHAR2(15) NOT NULL, -- Calculado por los triggers CEMJ_TRIGGER_VENTA_INSERT y CEMJ_TRIGGER_VENTA_UPDATE
    NOMBRE_COMPRADOR VARCHAR2(150),
    LUGAR_VENTA VARCHAR2(150),
    FECHA_CREACION DATE NOT NULL,
    FECHA_CONFIRMACION DATE,
    ESTADO VARCHAR2(12) NOT NULL,
    OBSERVACIONES VARCHAR2(300),
    FECHA_ANULACION DATE,
    ID_USUARIO_ANULA NUMBER(10),
    MOTIVO_ANULACION VARCHAR2(300),
    CONSTRAINT CEMJ_PK_VENTA PRIMARY KEY(ID_VENTA),
    CONSTRAINT CEMJ_FK_VENTA_SOLICITUD_COMPRA FOREIGN KEY(ID_SOLICITUD)
        REFERENCES CEMJ_SOLICITUD_COMPRA(ID_SOLICITUD),
    CONSTRAINT CEMJ_FK_VENTA_CLIENTE FOREIGN KEY(ID_CLIENTE) REFERENCES CEMJ_CLIENTE(ID_CLIENTE),
    CONSTRAINT CEMJ_FK_VENTA_USUARIO FOREIGN KEY(ID_USUARIO) REFERENCES CEMJ_USUARIO(ID_USUARIO),
    CONSTRAINT CEMJ_FK_VENTA_USUARIO_ANULA FOREIGN KEY(ID_USUARIO_ANULA) REFERENCES CEMJ_USUARIO(ID_USUARIO),
    CONSTRAINT CEMJ_UQ_VENTA_SOLICITUD UNIQUE(ID_SOLICITUD)
);
```

=== #raw("CEMJ_DETALLE_VENTA")
Línea 379 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_DETALLE_VENTA(
    ID_VENTA NUMBER NOT NULL,
    ID_PRODUCTO NUMBER NOT NULL,
    CANTIDAD NUMBER NOT NULL,
    PRECIO_UNITARIO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_DETALLE_VENTA PRIMARY KEY(ID_VENTA, ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_DETALLE_VENTA_VENTA FOREIGN KEY(ID_VENTA) REFERENCES CEMJ_VENTA(ID_VENTA),
    CONSTRAINT CEMJ_FK_DETALLE_VENTA_PRODUCTO FOREIGN KEY(ID_PRODUCTO) REFERENCES CEMJ_PRODUCTO(ID_PRODUCTO)
);
```

=== #raw("CEMJ_METODO_PAGO")
Línea 390 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_METODO_PAGO(
    ID_METODO_PAGO NUMBER NOT NULL,
    NOMBRE VARCHAR2(50) NOT NULL,
    DESCRIPCION VARCHAR2(200),
    ACTIVO NUMBER NOT NULL,
    CONSTRAINT CEMJ_PK_METODO_PAGO PRIMARY KEY(ID_METODO_PAGO),
    CONSTRAINT CEMJ_UQ_METODO_PAGO UNIQUE(NOMBRE)
);
```

=== #raw("CEMJ_PAGO")
Línea 400 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_PAGO(
    ID_PAGO NUMBER NOT NULL,
    ID_VENTA NUMBER NOT NULL,
    ID_METODO_PAGO NUMBER NOT NULL,
    ID_USUARIO_REGISTRA NUMBER NOT NULL,
    MONTO NUMBER NOT NULL,
    FECHA_PAGO DATE NOT NULL,
    REFERENCIA VARCHAR2(100),
    CONSTRAINT CEMJ_PK_PAGO PRIMARY KEY(ID_PAGO),
    CONSTRAINT CEMJ_FK_PAGO_VENTA FOREIGN KEY(ID_VENTA) REFERENCES CEMJ_VENTA(ID_VENTA),
    CONSTRAINT CEMJ_FK_PAGO_METODO_PAGO FOREIGN KEY(ID_METODO_PAGO)
        REFERENCES CEMJ_METODO_PAGO(ID_METODO_PAGO),
    CONSTRAINT CEMJ_FK_PAGO_USUARIO FOREIGN KEY(ID_USUARIO_REGISTRA)
        REFERENCES CEMJ_USUARIO(ID_USUARIO),
    CONSTRAINT CEMJ_UQ_PAGO_VENTA UNIQUE(ID_VENTA)
);
```

=== #raw("CEMJ_PAGO_SOLICITUD")
Línea 429 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_PAGO_SOLICITUD(
    ID_PAGO_SOLICITUD NUMBER NOT NULL,
    ID_SOLICITUD NUMBER NOT NULL,
    ID_METODO_PAGO NUMBER NOT NULL,
    ID_TRANSACCION VARCHAR2(32) NOT NULL,
    FECHA_REGISTRO DATE NOT NULL,
    CONSTRAINT CEMJ_PK_PAGO_SOLICITUD PRIMARY KEY(ID_PAGO_SOLICITUD),
    CONSTRAINT CEMJ_FK_PAGO_SOLICITUD_SOLICITUD_COMPRA FOREIGN KEY(ID_SOLICITUD)
        REFERENCES CEMJ_SOLICITUD_COMPRA(ID_SOLICITUD),
    CONSTRAINT CEMJ_FK_PAGO_SOLICITUD_METODO_PAGO FOREIGN KEY(ID_METODO_PAGO)
        REFERENCES CEMJ_METODO_PAGO(ID_METODO_PAGO),
    CONSTRAINT CEMJ_UQ_PAGO_SOLICITUD_SOLICITUD UNIQUE(ID_SOLICITUD),
    CONSTRAINT CEMJ_UQ_PAGO_SOLICITUD_TRANSACCION UNIQUE(ID_TRANSACCION)
);
```

=== #raw("CEMJ_MOVIMIENTO_INVENTARIO")
Línea 417 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_MOVIMIENTO_INVENTARIO(
    ID_MOVIMIENTO NUMBER NOT NULL,
    NUMERO_FOLIO NUMBER NOT NULL,
    ID_PRODUCTO NUMBER NOT NULL,
    ID_USUARIO NUMBER NOT NULL,
    ID_VENTA NUMBER,
    ID_MOVIMIENTO_ORIGEN NUMBER,
    TIPO_MOVIMIENTO VARCHAR2(25) NOT NULL,
    CANTIDAD NUMBER NOT NULL,
    ESTADO VARCHAR2(12) NOT NULL,
    FECHA_CREACION DATE NOT NULL,
    FECHA_APLICACION DATE,
    MOTIVO VARCHAR2(300),
    CONSTRAINT CEMJ_PK_MOVIMIENTO_INVENTARIO PRIMARY KEY(ID_MOVIMIENTO),
    CONSTRAINT CEMJ_FK_MOVIMIENTO_INVENTARIO_PRODUCTO FOREIGN KEY(ID_PRODUCTO) REFERENCES CEMJ_PRODUCTO(ID_PRODUCTO),
    CONSTRAINT CEMJ_FK_MOVIMIENTO_INVENTARIO_USUARIO FOREIGN KEY(ID_USUARIO) REFERENCES CEMJ_USUARIO(ID_USUARIO),
    CONSTRAINT CEMJ_FK_MOVIMIENTO_INVENTARIO_VENTA FOREIGN KEY(ID_VENTA) REFERENCES CEMJ_VENTA(ID_VENTA),
    CONSTRAINT CEMJ_FK_MOVIMIENTO_INVENTARIO_ORIGEN FOREIGN KEY(ID_MOVIMIENTO_ORIGEN)
        REFERENCES CEMJ_MOVIMIENTO_INVENTARIO(ID_MOVIMIENTO),
    CONSTRAINT CEMJ_UQ_MOVIMIENTO_INVENTARIO_ORIGEN UNIQUE(ID_MOVIMIENTO_ORIGEN),
    CONSTRAINT CEMJ_UQ_MOVIMIENTO_INVENTARIO_FOLIO UNIQUE(NUMERO_FOLIO)
);
```

=== #raw("CEMJ_AUDITORIA")
Línea 442 de `DB/script.sql`.

```sql
CREATE TABLE CEMJ_AUDITORIA(
    ID_AUDITORIA NUMBER NOT NULL,
    NOMBRE_TABLA VARCHAR2(30) NOT NULL,
    OPERACION VARCHAR2(15) NOT NULL,
    ID_REGISTRO VARCHAR2(150) NOT NULL,
    DETALLE VARCHAR2(1000),
    USUARIO_APP VARCHAR2(64), -- ID del usuario de la aplicacion 
    USUARIO_BD VARCHAR2(30) NOT NULL,
    EQUIPO VARCHAR2(100),
    FECHA DATE NOT NULL,
    CONSTRAINT CEMJ_PK_AUDITORIA PRIMARY KEY(ID_AUDITORIA)
);
```

== Secuencias
=== #raw("CEMJ_SEQ_FOLIO_SOLICITUD")
Línea 456 de `DB/script.sql`.

```sql
CREATE SEQUENCE CEMJ_SEQ_FOLIO_SOLICITUD
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
```

=== #raw("CEMJ_SEQ_FOLIO_MOVIMIENTO")
Línea 462 de `DB/script.sql`.

```sql
CREATE SEQUENCE CEMJ_SEQ_FOLIO_MOVIMIENTO
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;
```

= Anexo · Inventario de objetos PL/SQL
La línea corresponde a la declaración en el script. Las firmas permiten ubicar parámetros, tipos y resultados. Las declaraciones repetidas se conservan en el índice. Oracle usa la última definición de cada nombre. Las dos definiciones de CEMJ_FN_UNIDADES_VENDIDAS difieren en el límite final. La efectiva usa un límite exclusivo. CEMJ_FN_SOLICITUD_ESTADO también se declara dos veces.

== Triggers

- #raw("CEMJ_TRIGGER_ROL_INSERT") (l. 472) · #raw("BEFORE INSERT ON CEMJ_ROL")
- #raw("CEMJ_TRIGGER_ROL_UPDATE") (l. 486) · #raw("BEFORE UPDATE ON CEMJ_ROL")
- #raw("CEMJ_TRIGGER_CLIENTE_INSERT") (l. 497) · #raw("BEFORE INSERT ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_CLIENTE_UPDATE") (l. 543) · #raw("BEFORE UPDATE ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_USUARIO_INSERT") (l. 583) · #raw("BEFORE INSERT ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_USUARIO_UPDATE") (l. 601) · #raw("BEFORE UPDATE ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_CATEGORIA_INSERT") (l. 612) · #raw("BEFORE INSERT ON CEMJ_CATEGORIA_PRODUCTO")
- #raw("CEMJ_TRIGGER_CATEGORIA_UPDATE") (l. 630) · #raw("BEFORE UPDATE ON CEMJ_CATEGORIA_PRODUCTO")
- #raw("CEMJ_TRIGGER_CEPA_INSERT") (l. 646) · #raw("BEFORE INSERT ON CEMJ_CEPA")
- #raw("CEMJ_TRIGGER_CEPA_UPDATE") (l. 660) · #raw("BEFORE UPDATE ON CEMJ_CEPA")
- #raw("CEMJ_TRIGGER_PRODUCTO_INSERT") (l. 672) · #raw("BEFORE INSERT ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_PRODUCTO_UPDATE") (l. 695) · #raw("BEFORE UPDATE ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_PRODUCTO_CEPA_VALIDA") (l. 715) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_PRODUCTO_CEPA")
- #raw("CEMJ_TRIGGER_INVENTARIO_INSERT") (l. 726) · #raw("BEFORE INSERT ON CEMJ_INVENTARIO")
- #raw("CEMJ_TRIGGER_INVENTARIO_UPDATE") (l. 748) · #raw("BEFORE UPDATE ON CEMJ_INVENTARIO")
- #raw("CEMJ_TRIGGER_SOLICITUD_INSERT") (l. 763) · #raw("BEFORE INSERT ON CEMJ_SOLICITUD_COMPRA")
- #raw("CEMJ_TRIGGER_SOLICITUD_UPDATE") (l. 807) · #raw("BEFORE UPDATE ON CEMJ_SOLICITUD_COMPRA")
- #raw("CEMJ_TRIGGER_DETALLE_SOLICITUD_VALIDA") (l. 844) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_DETALLE_SOLICITUD")
- #raw("CEMJ_TRIGGER_VENTA_INSERT") (l. 859) · #raw("BEFORE INSERT ON CEMJ_VENTA")
- #raw("CEMJ_TRIGGER_VENTA_UPDATE") (l. 924) · #raw("BEFORE UPDATE ON CEMJ_VENTA")
- #raw("CEMJ_TRIGGER_DETALLE_VENTA_VALIDA") (l. 988) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_DETALLE_VENTA")
- #raw("CEMJ_TRIGGER_METODO_PAGO_INSERT") (l. 1004) · #raw("BEFORE INSERT ON CEMJ_METODO_PAGO")
- #raw("CEMJ_TRIGGER_METODO_PAGO_UPDATE") (l. 1018) · #raw("BEFORE UPDATE ON CEMJ_METODO_PAGO")
- #raw("CEMJ_TRIGGER_PAGO_INSERT") (l. 1030) · #raw("BEFORE INSERT ON CEMJ_PAGO")
- #raw("CEMJ_TRIGGER_PAGO_UPDATE") (l. 1044) · #raw("BEFORE UPDATE ON CEMJ_PAGO")
- #raw("CEMJ_TRIGGER_MOVIMIENTO_INVENTARIO_INSERT") (l. 1055) · #raw("BEFORE INSERT ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_MOVIMIENTO_INVENTARIO_UPDATE") (l. 1125) · #raw("BEFORE UPDATE ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_AUDITORIA_INSERT") (l. 1189) · #raw("BEFORE INSERT ON CEMJ_AUDITORIA")
- #raw("CEMJ_TRIGGER_AUDITORIA_BLOQUEA") (l. 1228) · #raw("BEFORE UPDATE OR DELETE ON CEMJ_AUDITORIA")
- #raw("CEMJ_TRIGGER_CATEGORIA_ID") (l. 1255) · #raw("FOR INSERT ON CEMJ_CATEGORIA_PRODUCTO COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_CATEGORIA_MAYUS") (l. 1280) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_CATEGORIA_PRODUCTO")
- #raw("CEMJ_TRIGGER_CEPA_ID") (l. 1470) · #raw("FOR INSERT ON CEMJ_CEPA COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_CEPA_MAYUSCULA") (l. 1496) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_CEPA")
- #raw("CEMJ_TRIGGER_CLIENTE_ID") (l. 1647) · #raw("FOR INSERT ON CEMJ_CLIENTE COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_CLIENTE_MAYUSCULA") (l. 1672) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_USUARIO_ID") (l. 1845) · #raw("FOR INSERT ON CEMJ_USUARIO COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_USUARIO_CORREO_MAYUS") (l. 1870) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_METODO_PAGO_ID") (l. 2055) · #raw("FOR INSERT ON CEMJ_METODO_PAGO COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_METODO_PAGO_MAYUS") (l. 2079) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_METODO_PAGO")
- #raw("CEMJ_TRIGGER_PRODUCTO_ID") (l. 2186) · #raw("FOR INSERT ON CEMJ_PRODUCTO COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_PRODUCTO_MAYUS") (l. 2209) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_SOLICITUD_ID") (l. 2585) · #raw("FOR INSERT ON CEMJ_SOLICITUD_COMPRA COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_MOVIMIENTO_ID") (l. 2997) · #raw("FOR INSERT ON CEMJ_MOVIMIENTO_INVENTARIO COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_MOVIMIENTO_MAYUS") (l. 3021) · #raw("BEFORE INSERT OR UPDATE ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_AUDITORIA_ID") (l. 3175) · #raw("FOR INSERT ON CEMJ_AUDITORIA COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_AUD_USUARIO_INSERT") (l. 3252) · #raw("AFTER INSERT ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_AUD_USUARIO_UPDATE") (l. 3281) · #raw("AFTER UPDATE ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_AUD_USUARIO_DELETE") (l. 3308) · #raw("AFTER DELETE ON CEMJ_USUARIO")
- #raw("CEMJ_TRIGGER_AUD_CLIENTE_INSERT") (l. 3317) · #raw("AFTER INSERT ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_AUD_CLIENTE_UPDATE") (l. 3352) · #raw("AFTER UPDATE ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_AUD_CLIENTE_DELETE") (l. 3391) · #raw("AFTER DELETE ON CEMJ_CLIENTE")
- #raw("CEMJ_TRIGGER_AUD_PRODUCTO_INSERT") (l. 3400) · #raw("AFTER INSERT ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_AUD_PRODUCTO_UPDATE") (l. 3416) · #raw("AFTER UPDATE ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_AUD_PRODUCTO_DELETE") (l. 3454) · #raw("AFTER DELETE ON CEMJ_PRODUCTO")
- #raw("CEMJ_TRIGGER_AUD_VENTA_INSERT") (l. 3467) · #raw("AFTER INSERT ON CEMJ_VENTA")
- #raw("CEMJ_TRIGGER_AUD_VENTA_UPDATE") (l. 3484) · #raw("AFTER UPDATE ON CEMJ_VENTA")
- #raw("CEMJ_TRIGGER_AUD_VENTA_DELETE") (l. 3513) · #raw("AFTER DELETE ON CEMJ_VENTA")
- #raw("CEMJ_TRIGGER_AUD_PAGO_INSERT") (l. 3526) · #raw("AFTER INSERT ON CEMJ_PAGO")
- #raw("CEMJ_TRIGGER_AUD_PAGO_UPDATE") (l. 3542) · #raw("AFTER UPDATE ON CEMJ_PAGO")
- #raw("CEMJ_TRIGGER_AUD_PAGO_DELETE") (l. 3559) · #raw("AFTER DELETE ON CEMJ_PAGO")
- #raw("CEMJ_TRIGGER_AUD_MOVIMIENTO_INSERT") (l. 3573) · #raw("AFTER INSERT ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_AUD_MOVIMIENTO_UPDATE") (l. 3590) · #raw("AFTER UPDATE ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_AUD_MOVIMIENTO_DELETE") (l. 3609) · #raw("AFTER DELETE ON CEMJ_MOVIMIENTO_INVENTARIO")
- #raw("CEMJ_TRIGGER_INVENTARIO_ALERTA") (l. 3652) · #raw("AFTER UPDATE OF STOCK_ACTUAL, STOCK_MINIMO ON CEMJ_INVENTARIO")
- #raw("CEMJ_TRIGGER_VENTA_ID") (l. 4149) · #raw("FOR INSERT ON CEMJ_VENTA COMPOUND TRIGGER")
- #raw("CEMJ_TRIGGER_PAGO_ID") (l. 4185) · #raw("FOR INSERT ON CEMJ_PAGO COMPOUND TRIGGER")

== Procedimientos

*Línea 1290*

```sql
CEMJ_PA_CATEGORIA_CREAR(
    P_NOMBRE CEMJ_CATEGORIA_PRODUCTO.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_CATEGORIA_PRODUCTO.DESCRIPCION%TYPE,
    P_UNIDAD_MEDIDA CEMJ_CATEGORIA_PRODUCTO.UNIDAD_MEDIDA%TYPE
)
```

*Línea 1339*

```sql
CEMJ_PA_CATEGORIA_MODIFICAR(
    P_ID_CATEGORIA CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE,
    P_NOMBRE CEMJ_CATEGORIA_PRODUCTO.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_CATEGORIA_PRODUCTO.DESCRIPCION%TYPE,
    P_UNIDAD_MEDIDA CEMJ_CATEGORIA_PRODUCTO.UNIDAD_MEDIDA%TYPE
)
```

*Línea 1377*

```sql
CEMJ_PA_CATEGORIA_ELIMINAR(
    P_ID_CATEGORIA CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE
)
```

*Línea 1420*

```sql
CEMJ_PA_CATEGORIA_REACTIVAR(
    P_ID_CATEGORIA CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE
)
```

*Línea 1443*

```sql
CEMJ_PA_CATEGORIA_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_ACTIVOS CEMJ_CATEGORIA_PRODUCTO.ACTIVO%TYPE DEFAULT 1
)
```

*Línea 1505*

```sql
CEMJ_PA_CEPA_CREAR(
    P_NOMBRE CEMJ_CEPA.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_CEPA.DESCRIPCION%TYPE
)
```

*Línea 1524*

```sql
CEMJ_PA_CEPA_MODIFICAR(
    P_ID_CEPA CEMJ_CEPA.ID_CEPA%TYPE,
    P_NOMBRE CEMJ_CEPA.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_CEPA.DESCRIPCION%TYPE
)
```

*Línea 1551*

```sql
CEMJ_PA_CEPA_ELIMINAR(
    P_ID_CEPA CEMJ_CEPA.ID_CEPA%TYPE
)
```

*Línea 1595*

```sql
CEMJ_PA_CEPA_REACTIVAR(
    P_ID_CEPA CEMJ_CEPA.ID_CEPA%TYPE
)
```

*Línea 1618*

```sql
CEMJ_PA_CEPA_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_ACTIVOS CEMJ_CEPA.ACTIVO%TYPE DEFAULT 1
)
```

*Línea 1682*

```sql
CEMJ_PA_CLIENTE_CREAR(
    P_TIPO_CLIENTE CEMJ_CLIENTE.TIPO_CLIENTE%TYPE,
    P_RUT CEMJ_CLIENTE.RUT%TYPE,
    P_NOMBRE CEMJ_CLIENTE.NOMBRE%TYPE,
    P_APELLIDO1 CEMJ_CLIENTE.APELLIDO1%TYPE,
    P_APELLIDO2 CEMJ_CLIENTE.APELLIDO2%TYPE,
    P_RAZON_SOCIAL CEMJ_CLIENTE.RAZON_SOCIAL%TYPE,
    P_TELEFONO CEMJ_CLIENTE.TELEFONO%TYPE,
    P_CORREO CEMJ_CLIENTE.CORREO%TYPE
)
```

*Línea 1708*

```sql
CEMJ_PA_CLIENTE_MODIFICAR(
    P_ID_CLIENTE CEMJ_CLIENTE.ID_CLIENTE%TYPE,
    P_TIPO_CLIENTE CEMJ_CLIENTE.TIPO_CLIENTE%TYPE,
    P_RUT CEMJ_CLIENTE.RUT%TYPE,
    P_NOMBRE CEMJ_CLIENTE.NOMBRE%TYPE,
    P_APELLIDO1 CEMJ_CLIENTE.APELLIDO1%TYPE,
    P_APELLIDO2 CEMJ_CLIENTE.APELLIDO2%TYPE,
    P_RAZON_SOCIAL CEMJ_CLIENTE.RAZON_SOCIAL%TYPE,
    P_TELEFONO CEMJ_CLIENTE.TELEFONO%TYPE,
    P_CORREO CEMJ_CLIENTE.CORREO%TYPE
)
```

*Línea 1747*

```sql
CEMJ_PA_CLIENTE_ELIMINAR(
    P_ID_CLIENTE CEMJ_CLIENTE.ID_CLIENTE%TYPE
)
```

*Línea 1792*

```sql
CEMJ_PA_CLIENTE_REACTIVAR(
    P_ID_CLIENTE CEMJ_CLIENTE.ID_CLIENTE%TYPE
)
```

*Línea 1816*

```sql
CEMJ_PA_CLIENTE_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_ACTIVOS CEMJ_CLIENTE.ACTIVO%TYPE DEFAULT 1
)
```

*Línea 1879*

```sql
CEMJ_PA_USUARIO_CREAR(
    P_ID_ROL CEMJ_USUARIO.ID_ROL%TYPE,
    P_ID_CLIENTE CEMJ_USUARIO.ID_CLIENTE%TYPE,
    P_CORREO CEMJ_USUARIO.CORREO%TYPE,
    P_PASSWORD_HASH CEMJ_USUARIO.PASSWORD_HASH%TYPE,
    P_ACTIVO CEMJ_USUARIO.ACTIVO%TYPE
)
```

*Línea 1918*

```sql
CEMJ_PA_USUARIO_MODIFICAR(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_ID_ROL CEMJ_USUARIO.ID_ROL%TYPE,
    P_ID_CLIENTE CEMJ_USUARIO.ID_CLIENTE%TYPE,
    P_CORREO CEMJ_USUARIO.CORREO%TYPE,
    P_PASSWORD_HASH CEMJ_USUARIO.PASSWORD_HASH%TYPE,
    P_ACTIVO CEMJ_USUARIO.ACTIVO%TYPE
)
```

*Línea 1973*

```sql
CEMJ_PA_USUARIO_ELIMINAR(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE
)
```

*Línea 2012*

```sql
CEMJ_PA_USUARIO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_ACTIVOS CEMJ_USUARIO.ACTIVO%TYPE DEFAULT 1
)
```

*Línea 2029*

```sql
CEMJ_PA_ROL_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR
)
```

*Línea 2088*

```sql
CEMJ_PA_METODO_PAGO_CREAR(
    P_NOMBRE CEMJ_METODO_PAGO.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_METODO_PAGO.DESCRIPCION%TYPE,
    P_ACTIVO CEMJ_METODO_PAGO.ACTIVO%TYPE
)
```

*Línea 2108*

```sql
CEMJ_PA_METODO_PAGO_MODIFICAR(
    P_ID_METODO_PAGO CEMJ_METODO_PAGO.ID_METODO_PAGO%TYPE,
    P_NOMBRE CEMJ_METODO_PAGO.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_METODO_PAGO.DESCRIPCION%TYPE,
    P_ACTIVO CEMJ_METODO_PAGO.ACTIVO%TYPE
)
```

*Línea 2136*

```sql
CEMJ_PA_METODO_PAGO_ELIMINAR(
    P_ID_METODO_PAGO CEMJ_METODO_PAGO.ID_METODO_PAGO%TYPE
)
```

*Línea 2159*

```sql
CEMJ_PA_METODO_PAGO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_ACTIVOS CEMJ_METODO_PAGO.ACTIVO%TYPE DEFAULT 1
)
```

*Línea 2233*

```sql
CEMJ_PA_PRODUCTO_CREAR(
    P_ID_CATEGORIA CEMJ_PRODUCTO.ID_CATEGORIA%TYPE, P_CODIGO CEMJ_PRODUCTO.CODIGO%TYPE,
    P_NOMBRE CEMJ_PRODUCTO.NOMBRE%TYPE, P_DESCRIPCION CEMJ_PRODUCTO.DESCRIPCION%TYPE,
    P_FORMATO CEMJ_PRODUCTO.FORMATO%TYPE, P_ANADA CEMJ_PRODUCTO.ANADA%TYPE,
    P_PRECIO_ACTUAL CEMJ_PRODUCTO.PRECIO_ACTUAL%TYPE, P_ACTIVO CEMJ_PRODUCTO.ACTIVO%TYPE,
    P_STOCK_MINIMO CEMJ_INVENTARIO.STOCK_MINIMO%TYPE
)
```

*Línea 2283*

```sql
CEMJ_PA_PRODUCTO_MODIFICAR(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE, P_ID_CATEGORIA CEMJ_PRODUCTO.ID_CATEGORIA%TYPE,
    P_CODIGO CEMJ_PRODUCTO.CODIGO%TYPE, P_NOMBRE CEMJ_PRODUCTO.NOMBRE%TYPE,
    P_DESCRIPCION CEMJ_PRODUCTO.DESCRIPCION%TYPE, P_FORMATO CEMJ_PRODUCTO.FORMATO%TYPE,
    P_ANADA CEMJ_PRODUCTO.ANADA%TYPE, P_PRECIO_ACTUAL CEMJ_PRODUCTO.PRECIO_ACTUAL%TYPE,
    P_ACTIVO CEMJ_PRODUCTO.ACTIVO%TYPE
)
```

*Línea 2336*

```sql
CEMJ_PA_PRODUCTO_ELIMINAR(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
)
```

*Línea 2360*

```sql
CEMJ_PA_PRODUCTO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR
)
```

*Línea 2430*

```sql
CEMJ_PA_CATALOGO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR
)
```

*Línea 2464*

```sql
CEMJ_PA_PROD_CEPA_CREAR(
    P_ID_PRODUCTO CEMJ_PRODUCTO_CEPA.ID_PRODUCTO%TYPE, P_ID_CEPA CEMJ_PRODUCTO_CEPA.ID_CEPA%TYPE,
    P_PORCENTAJE CEMJ_PRODUCTO_CEPA.PORCENTAJE%TYPE
)
```

*Línea 2491*

```sql
CEMJ_PA_PROD_CEPA_MODIFICAR(
    P_ID_PRODUCTO CEMJ_PRODUCTO_CEPA.ID_PRODUCTO%TYPE, P_ID_CEPA CEMJ_PRODUCTO_CEPA.ID_CEPA%TYPE,
    P_PORCENTAJE CEMJ_PRODUCTO_CEPA.PORCENTAJE%TYPE
)
```

*Línea 2524*

```sql
CEMJ_PA_PROD_CEPA_ELIMINAR(
    P_ID_PRODUCTO CEMJ_PRODUCTO_CEPA.ID_PRODUCTO%TYPE,
    P_ID_CEPA CEMJ_PRODUCTO_CEPA.ID_CEPA%TYPE
)
```

*Línea 2556*

```sql
CEMJ_PA_PROD_CEPA_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ID_PRODUCTO CEMJ_PRODUCTO_CEPA.ID_PRODUCTO%TYPE
)
```

*Línea 2609*

```sql
CEMJ_PA_SOLICITUD_CREAR(
    P_ID_CLIENTE CEMJ_SOLICITUD_COMPRA.ID_CLIENTE%TYPE,
    P_OBSERVACIONES CEMJ_SOLICITUD_COMPRA.OBSERVACIONES%TYPE
)
```

*Línea 2644*

```sql
CEMJ_PA_SOLICITUD_MODIFICAR(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE, P_ID_CLIENTE CEMJ_SOLICITUD_COMPRA.ID_CLIENTE%TYPE,
    P_OBSERVACIONES CEMJ_SOLICITUD_COMPRA.OBSERVACIONES%TYPE
)
```

*Línea 2678*

```sql
CEMJ_PA_SOLICITUD_ELIMINAR(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
```

*Línea 2789*

```sql
CEMJ_PA_SOLICITUD_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ID_CLIENTE CEMJ_SOLICITUD_COMPRA.ID_CLIENTE%TYPE DEFAULT NULL
)
```

*Línea 2864*

```sql
CEMJ_PA_DET_SOLIC_CREAR(
    P_ID_SOLICITUD CEMJ_DETALLE_SOLICITUD.ID_SOLICITUD%TYPE, P_ID_PRODUCTO CEMJ_DETALLE_SOLICITUD.ID_PRODUCTO%TYPE,
    P_CANTIDAD CEMJ_DETALLE_SOLICITUD.CANTIDAD%TYPE
)
```

*Línea 2894*

```sql
CEMJ_PA_DET_SOLIC_MODIFICAR(
    P_ID_SOLICITUD CEMJ_DETALLE_SOLICITUD.ID_SOLICITUD%TYPE, P_ID_PRODUCTO CEMJ_DETALLE_SOLICITUD.ID_PRODUCTO%TYPE,
    P_CANTIDAD CEMJ_DETALLE_SOLICITUD.CANTIDAD%TYPE
)
```

*Línea 2932*

```sql
CEMJ_PA_DET_SOLIC_ELIMINAR(
    P_ID_SOLICITUD CEMJ_DETALLE_SOLICITUD.ID_SOLICITUD%TYPE,
    P_ID_PRODUCTO CEMJ_DETALLE_SOLICITUD.ID_PRODUCTO%TYPE
)
```

*Línea 2964*

```sql
CEMJ_PA_DET_SOLIC_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ID_SOLICITUD CEMJ_DETALLE_SOLICITUD.ID_SOLICITUD%TYPE
)
```

*Línea 3030*

```sql
CEMJ_PA_MOVIMIENTO_CREAR(
    P_ID_PRODUCTO CEMJ_MOVIMIENTO_INVENTARIO.ID_PRODUCTO%TYPE, P_ID_USUARIO CEMJ_MOVIMIENTO_INVENTARIO.ID_USUARIO%TYPE,
    P_TIPO_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.TIPO_MOVIMIENTO%TYPE, P_CANTIDAD CEMJ_MOVIMIENTO_INVENTARIO.CANTIDAD%TYPE,
    P_MOTIVO CEMJ_MOVIMIENTO_INVENTARIO.MOTIVO%TYPE
)
```

*Línea 3070*

```sql
CEMJ_PA_MOVIMIENTO_MODIFICAR(
    P_ID_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.ID_MOVIMIENTO%TYPE, P_ID_PRODUCTO CEMJ_MOVIMIENTO_INVENTARIO.ID_PRODUCTO%TYPE,
    P_TIPO_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.TIPO_MOVIMIENTO%TYPE, P_CANTIDAD CEMJ_MOVIMIENTO_INVENTARIO.CANTIDAD%TYPE,
    P_MOTIVO CEMJ_MOVIMIENTO_INVENTARIO.MOTIVO%TYPE
)
```

*Línea 3111*

```sql
CEMJ_PA_MOVIMIENTO_ELIMINAR(
    P_ID_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.ID_MOVIMIENTO%TYPE
)
```

*Línea 3142*

```sql
CEMJ_PA_MOVIMIENTO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR
)
```

*Línea 3225*

```sql
CEMJ_PA_AUDITORIA_REGISTRAR(
    P_NOMBRE_TABLA CEMJ_AUDITORIA.NOMBRE_TABLA%TYPE, P_OPERACION CEMJ_AUDITORIA.OPERACION%TYPE,
    P_ID_REGISTRO CEMJ_AUDITORIA.ID_REGISTRO%TYPE, P_DETALLE CEMJ_AUDITORIA.DETALLE%TYPE,
    P_USUARIO_APP CEMJ_AUDITORIA.USUARIO_APP%TYPE DEFAULT NULL
)
```

*Línea 3679*

```sql
CEMJ_PA_AUDITORIA_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_NOMBRE_TABLA CEMJ_AUDITORIA.NOMBRE_TABLA%TYPE DEFAULT NULL,
    P_DIAS NUMBER DEFAULT 7
)
```

*Línea 3712*

```sql
CEMJ_PA_ALERTA_STOCK_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_BAJO_MINIMO NUMBER DEFAULT 1,
    P_DIAS NUMBER DEFAULT 30
)
```

*Línea 3736*

```sql
CEMJ_PA_SESION_USUARIO(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE
)
```

*Línea 3749*

```sql
CEMJ_PA_LOGIN_REGISTRAR(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE, P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_EXITOSO NUMBER, P_MOTIVO CEMJ_AUDITORIA.DETALLE%TYPE
)
```

*Línea 3812*

```sql
CEMJ_PA_LOGIN_DATOS(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE,
    P_ID_USUARIO OUT CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_PASSWORD_HASH OUT CEMJ_USUARIO.PASSWORD_HASH%TYPE,
    P_ACTIVO OUT CEMJ_USUARIO.ACTIVO%TYPE,
    P_ID_CLIENTE OUT CEMJ_USUARIO.ID_CLIENTE%TYPE,
    P_ROL OUT CEMJ_ROL.NOMBRE%TYPE,
    P_ROL_ACTIVO OUT CEMJ_ROL.ACTIVO%TYPE
)
```

*Línea 3863*

```sql
CEMJ_PA_LOGIN_RESULTADO(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE, P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_EXITOSO NUMBER
)
```

*Línea 3917*

```sql
CEMJ_PA_LOGIN_MODULOS(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_USUARIOS OUT NUMBER, P_CLIENTES OUT NUMBER, P_PRODUCTOS OUT NUMBER,
    P_METODOS_PAGO OUT NUMBER, P_INVENTARIO OUT NUMBER, P_VENTAS OUT NUMBER,
    P_SOLICITUDES OUT NUMBER, P_REPORTES OUT NUMBER, P_MONITOREO OUT NUMBER,
    P_CATALOGO OUT NUMBER, P_MIS_SOLICITUDES OUT NUMBER
)
```

*Línea 3941*

```sql
CEMJ_PA_USUARIO_CAMBIAR_CLAVE(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_PASSWORD_HASH_NUEVO CEMJ_USUARIO.PASSWORD_HASH%TYPE
)
```

*Línea 3979*

```sql
CEMJ_PA_LOGIN_INTENTO_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_SOLO_FALLIDOS NUMBER DEFAULT 0,
    P_DIAS NUMBER DEFAULT 7
)
```

*Línea 4057*

```sql
CEMJ_PA_REGISTRAR_CLIENTE(
    P_TIPO_CLIENTE CEMJ_CLIENTE.TIPO_CLIENTE%TYPE, P_RUT CEMJ_CLIENTE.RUT%TYPE,
    P_NOMBRE CEMJ_CLIENTE.NOMBRE%TYPE, P_APELLIDO1 CEMJ_CLIENTE.APELLIDO1%TYPE,
    P_APELLIDO2 CEMJ_CLIENTE.APELLIDO2%TYPE, P_RAZON_SOCIAL CEMJ_CLIENTE.RAZON_SOCIAL%TYPE,
    P_TELEFONO CEMJ_CLIENTE.TELEFONO%TYPE, P_CORREO CEMJ_USUARIO.CORREO%TYPE,
    P_PASSWORD_HASH CEMJ_USUARIO.PASSWORD_HASH%TYPE,
    P_ID_USUARIO OUT CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_ID_CLIENTE OUT CEMJ_CLIENTE.ID_CLIENTE%TYPE
)
```

*Línea 4261*

```sql
CEMJ_PA_GES_MOV_APLICAR(
    P_ID_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.ID_MOVIMIENTO%TYPE,
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE
)
```

*Línea 4368*

```sql
CEMJ_PA_GES_VENTA_CREAR(
    P_ID_USUARIO CEMJ_VENTA.ID_USUARIO%TYPE, P_ID_CLIENTE CEMJ_VENTA.ID_CLIENTE%TYPE,
    P_NOMBRE_COMPRADOR CEMJ_VENTA.NOMBRE_COMPRADOR%TYPE, P_LUGAR_VENTA CEMJ_VENTA.LUGAR_VENTA%TYPE,
    P_OBSERVACIONES CEMJ_VENTA.OBSERVACIONES%TYPE,
    P_ID_VENTA OUT CEMJ_VENTA.ID_VENTA%TYPE
)
```

*Línea 4435*

```sql
CEMJ_PA_GES_VENTA_AGREGAR(
    P_ID_VENTA CEMJ_DETALLE_VENTA.ID_VENTA%TYPE, P_ID_PRODUCTO CEMJ_DETALLE_VENTA.ID_PRODUCTO%TYPE,
    P_CANTIDAD CEMJ_DETALLE_VENTA.CANTIDAD%TYPE
)
```

*Línea 4509*

```sql
CEMJ_PA_GES_SOLIC_ENVIAR(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
```

*Línea 4564*

```sql
CEMJ_PA_GES_SOLIC_RESOLVER(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE,
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_DECISION CEMJ_SOLICITUD_COMPRA.ESTADO%TYPE,
    P_ID_VENTA OUT CEMJ_VENTA.ID_VENTA%TYPE
)
```

*Línea 4683*

```sql
CEMJ_PA_GES_VENTA_CONFIRMAR(
    P_ID_VENTA CEMJ_VENTA.ID_VENTA%TYPE, P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_ID_METODO_PAGO CEMJ_PAGO.ID_METODO_PAGO%TYPE, P_REFERENCIA CEMJ_PAGO.REFERENCIA%TYPE
)
```

*Línea 4801*

```sql
CEMJ_PA_GES_VENTA_ANULAR(
    P_ID_VENTA CEMJ_VENTA.ID_VENTA%TYPE, P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_MOTIVO CEMJ_VENTA.MOTIVO_ANULACION%TYPE
)
```

*Línea 4966*

```sql
CEMJ_PA_GES_VENTA_LISTAR(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ESTADO CEMJ_VENTA.ESTADO%TYPE DEFAULT NULL
)
```

*Línea 4989*

```sql
CEMJ_PA_GES_VENTA_DETALLE(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ID_VENTA CEMJ_DETALLE_VENTA.ID_VENTA%TYPE
)
```

*Línea 5192*

```sql
CEMJ_PA_REP_RANKING_PRODUCTOS(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ANIO NUMBER DEFAULT NULL,
    P_MES NUMBER DEFAULT NULL
)
```

*Línea 5291*

```sql
CEMJ_PA_REP_MAS_VENDIDOS(
    P_CURSOR OUT SYS_REFCURSOR,
    P_DIAS NUMBER DEFAULT 30,
    P_TOP NUMBER DEFAULT 3
)
```

*Línea 5445*

```sql
CEMJ_PA_REP_VENTAS_CANAL(
    P_CURSOR OUT SYS_REFCURSOR,
    P_ANIO NUMBER DEFAULT NULL
)
```

*Línea 5617*

```sql
CEMJ_PA_REP_STOCK_CRITICO(
    P_CURSOR OUT SYS_REFCURSOR,
    P_DIAS NUMBER DEFAULT 30,
    P_SOLO_ALERTAS NUMBER DEFAULT 0
)
```


== Funciones

*Línea 1242*

```sql
CEMJ_FN_PK_CATEGORIA
RETURN CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE
```

*Línea 1309*

```sql
CEMJ_FN_CATEGORIA_UNIDAD(
    P_ID_CATEGORIA CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE
)
RETURN CEMJ_CATEGORIA_PRODUCTO.UNIDAD_MEDIDA%TYPE
```

*Línea 1324*

```sql
CEMJ_FN_CATEGORIA_CANT_PROD(
    P_ID_CATEGORIA CEMJ_CATEGORIA_PRODUCTO.ID_CATEGORIA%TYPE
)
RETURN NUMBER
```

*Línea 1459*

```sql
CEMJ_FN_PK_CEPA
RETURN CEMJ_CEPA.ID_CEPA%TYPE
```

*Línea 1634*

```sql
CEMJ_FN_PK_CLIENTE
RETURN CEMJ_CLIENTE.ID_CLIENTE%TYPE
```

*Línea 1832*

```sql
CEMJ_FN_PK_USUARIO
RETURN CEMJ_USUARIO.ID_USUARIO%TYPE
```

*Línea 2043*

```sql
CEMJ_FN_PK_METODO_PAGO
RETURN CEMJ_METODO_PAGO.ID_METODO_PAGO%TYPE
```

*Línea 2174*

```sql
CEMJ_FN_PK_PRODUCTO
RETURN CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
```

*Línea 2218*

```sql
CEMJ_FN_PRODUCTO_OBTENER_ID(
    P_CODIGO CEMJ_PRODUCTO.CODIGO%TYPE
)
RETURN CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
```

*Línea 2268*

```sql
CEMJ_FN_PRODUCTO_TOTAL_CEPAS(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
)
RETURN NUMBER
```

*Línea 2376*

```sql
CEMJ_FN_PRODUCTO_COMPOSICION(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
)
RETURN VARCHAR2
```

*Línea 2413*

```sql
CEMJ_FN_PRODUCTO_DISPONIBILIDAD(
    P_STOCK CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE
)
RETURN VARCHAR2
```

*Línea 2449*

```sql
CEMJ_FN_PRODUCTO_ESTADO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
)
RETURN CEMJ_PRODUCTO.ACTIVO%TYPE
```

*Línea 2573*

```sql
CEMJ_FN_PK_SOLICITUD
RETURN CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
```

*Línea 2629*

```sql
CEMJ_FN_SOLICITUD_ESTADO(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
RETURN CEMJ_SOLICITUD_COMPRA.ESTADO%TYPE
```

*Línea 2709*

```sql
CEMJ_FN_CLIENTE_NOMBRE(
    P_ID_CLIENTE CEMJ_CLIENTE.ID_CLIENTE%TYPE
)
RETURN VARCHAR2
```

*Línea 2736*

```sql
CEMJ_FN_SOLICITUD_TOTAL(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
RETURN NUMBER
```

*Línea 2751*

```sql
CEMJ_FN_SOLICITUD_ID_VENTA(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
RETURN CEMJ_VENTA.ID_VENTA%TYPE
```

*Línea 2770*

```sql
CEMJ_FN_SOLICITUD_ESTADO_VENTA(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
RETURN CEMJ_VENTA.ESTADO%TYPE
```

*Línea 2810*

```sql
CEMJ_FN_SOLICITUD_DEL_CLIENTE(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE,
    P_ID_CLIENTE CEMJ_SOLICITUD_COMPRA.ID_CLIENTE%TYPE
)
RETURN NUMBER
```

*Línea 2833*

```sql
CEMJ_FN_PRODUCTO_PRECIO_ACTIVO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE
)
RETURN CEMJ_PRODUCTO.PRECIO_ACTUAL%TYPE
```

*Línea 2849*

```sql
CEMJ_FN_SOLICITUD_ESTADO(
    P_ID_SOLICITUD CEMJ_SOLICITUD_COMPRA.ID_SOLICITUD%TYPE
)
RETURN CEMJ_SOLICITUD_COMPRA.ESTADO%TYPE
```

*Línea 2985*

```sql
CEMJ_FN_PK_MOVIMIENTO
RETURN CEMJ_MOVIMIENTO_INVENTARIO.ID_MOVIMIENTO%TYPE
```

*Línea 3055*

```sql
CEMJ_FN_MOVIMIENTO_ESTADO(
    P_ID_MOVIMIENTO CEMJ_MOVIMIENTO_INVENTARIO.ID_MOVIMIENTO%TYPE
)
RETURN CEMJ_MOVIMIENTO_INVENTARIO.ESTADO%TYPE
```

*Línea 3163*

```sql
CEMJ_FN_PK_AUDITORIA
RETURN CEMJ_AUDITORIA.ID_AUDITORIA%TYPE
```

*Línea 3199*

```sql
CEMJ_FN_AUD_CAMBIO(
    P_CAMPO VARCHAR2, P_ANTES VARCHAR2, P_DESPUES VARCHAR2
)
RETURN VARCHAR2
```

*Línea 3237*

```sql
CEMJ_FN_ALERTAS_PENDIENTES
RETURN NUMBER
```

*Línea 3622*

```sql
CEMJ_FN_ALERTA_STOCK_ABIERTA(
    P_ID_PRODUCTO CEMJ_INVENTARIO.ID_PRODUCTO%TYPE
)
RETURN NUMBER
```

*Línea 3697*

```sql
CEMJ_FN_STOCK_SITUACION(
    P_STOCK_ACTUAL CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE,
    P_STOCK_MINIMO CEMJ_INVENTARIO.STOCK_MINIMO%TYPE
)
RETURN VARCHAR2
```

*Línea 3774*

```sql
CEMJ_FN_LOGIN_BLOQUEADO(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE
)
RETURN NUMBER
```

*Línea 3879*

```sql
CEMJ_FN_PUEDE_ACCEDER(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE,
    P_MODULO VARCHAR2
)
RETURN NUMBER
```

*Línea 3965*

```sql
CEMJ_FN_LOGIN_EXITOSO(
    P_OPERACION CEMJ_AUDITORIA.OPERACION%TYPE
)
RETURN VARCHAR2
```

*Línea 3999*

```sql
CEMJ_FN_USUARIO_CORREO_EXISTE(
    P_CORREO CEMJ_USUARIO.CORREO%TYPE
)
RETURN NUMBER
```

*Línea 4018*

```sql
CEMJ_FN_CLIENTE_RUT_EXISTE(
    P_RUT CEMJ_CLIENTE.RUT%TYPE
)
RETURN NUMBER
```

*Línea 4038*

```sql
CEMJ_FN_ROL_CLIENTE_ID
RETURN CEMJ_ROL.ID_ROL%TYPE
```

*Línea 4137*

```sql
CEMJ_FN_PK_VENTA
RETURN CEMJ_VENTA.ID_VENTA%TYPE
```

*Línea 4173*

```sql
CEMJ_FN_PK_PAGO
RETURN CEMJ_PAGO.ID_PAGO%TYPE
```

*Línea 4209*

```sql
CEMJ_FN_USUARIO_ES_PERSONAL(
    P_ID_USUARIO CEMJ_USUARIO.ID_USUARIO%TYPE
)
RETURN NUMBER
```

*Línea 4230*

```sql
CEMJ_FN_STOCK_DISPONIBLE(
    P_ID_PRODUCTO CEMJ_INVENTARIO.ID_PRODUCTO%TYPE
)
RETURN CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE
```

*Línea 4246*

```sql
CEMJ_FN_VENTA_TOTAL(
    P_ID_VENTA CEMJ_DETALLE_VENTA.ID_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 4348*

```sql
CEMJ_FN_CLIENTE_ESTADO(
    P_ID_CLIENTE CEMJ_CLIENTE.ID_CLIENTE%TYPE
)
RETURN CEMJ_CLIENTE.ACTIVO%TYPE
```

*Línea 4418*

```sql
CEMJ_FN_DET_VENTA_CANTIDAD(
    P_ID_VENTA CEMJ_DETALLE_VENTA.ID_VENTA%TYPE,
    P_ID_PRODUCTO CEMJ_DETALLE_VENTA.ID_PRODUCTO%TYPE
)
RETURN NUMBER
```

*Línea 4664*

```sql
CEMJ_FN_METODO_PAGO_ESTADO(
    P_ID_METODO_PAGO CEMJ_METODO_PAGO.ID_METODO_PAGO%TYPE
)
RETURN CEMJ_METODO_PAGO.ACTIVO%TYPE
```

*Línea 4889*

```sql
CEMJ_FN_VENTA_FOLIO_SOLICITUD(
    P_ID_SOLICITUD CEMJ_VENTA.ID_SOLICITUD%TYPE
)
RETURN CEMJ_SOLICITUD_COMPRA.NUMERO_FOLIO%TYPE
```

*Línea 4912*

```sql
CEMJ_FN_VENTA_COMPRADOR(
    P_ID_VENTA CEMJ_VENTA.ID_VENTA%TYPE
)
RETURN VARCHAR2
```

*Línea 4945*

```sql
CEMJ_FN_VENTA_METODO_PAGO(
    P_ID_VENTA CEMJ_VENTA.ID_VENTA%TYPE
)
RETURN CEMJ_METODO_PAGO.NOMBRE%TYPE
```

*Línea 5005*

```sql
CEMJ_FN_UNIDADES_VENDIDAS(
    P_ID_PRODUCTO CEMJ_DETALLE_VENTA.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5025*

```sql
CEMJ_FN_UNIDADES_VENDIDAS(
    P_ID_PRODUCTO CEMJ_DETALLE_VENTA.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5046*

```sql
CEMJ_FN_MONTO_VENDIDO(
    P_ID_PRODUCTO CEMJ_DETALLE_VENTA.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5066*

```sql
CEMJ_FN_TOTAL_UNIDADES_VENDIDAS(
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5084*

```sql
CEMJ_FN_PCT_UNIDADES(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5105*

```sql
CEMJ_FN_POS_MAS_VENDIDO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5136*

```sql
CEMJ_FN_POS_MENOS_VENDIDO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5165*

```sql
CEMJ_FN_CLASIFICACION_PRODUCTO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN VARCHAR2
```

*Línea 5261*

```sql
CEMJ_FN_POS_MAS_VENDIDO_WEB(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DESDE CEMJ_VENTA.FECHA_CONFIRMACION%TYPE,
    P_HASTA CEMJ_VENTA.FECHA_CONFIRMACION%TYPE
)
RETURN NUMBER
```

*Línea 5324*

```sql
CEMJ_FN_REP_VENTAS_CONFIRMADAS(
    P_MES VARCHAR2,
    P_CANAL CEMJ_VENTA.CANAL_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 5342*

```sql
CEMJ_FN_REP_VENTAS_ANULADAS(
    P_MES VARCHAR2,
    P_CANAL CEMJ_VENTA.CANAL_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 5360*

```sql
CEMJ_FN_REP_MONTO_CANAL(
    P_MES VARCHAR2,
    P_CANAL CEMJ_VENTA.CANAL_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 5383*

```sql
CEMJ_FN_REP_TICKET_CANAL(
    P_MES VARCHAR2,
    P_CANAL CEMJ_VENTA.CANAL_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 5404*

```sql
CEMJ_FN_REP_MONTO_MES(
    P_MES VARCHAR2
)
RETURN NUMBER
```

*Línea 5425*

```sql
CEMJ_FN_REP_PCT_CANAL(
    P_MES VARCHAR2,
    P_CANAL CEMJ_VENTA.CANAL_VENTA%TYPE
)
RETURN NUMBER
```

*Línea 5493*

```sql
CEMJ_FN_REP_VENDIDAS(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DIAS NUMBER
)
RETURN NUMBER
```

*Línea 5504*

```sql
CEMJ_FN_REP_PROM_DIARIO(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_DIAS NUMBER
)
RETURN NUMBER
```

*Línea 5518*

```sql
CEMJ_FN_REP_DIAS_COB(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_STOCK_ACTUAL CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE,
    P_DIAS NUMBER
)
RETURN NUMBER
```

*Línea 5546*

```sql
CEMJ_FN_REP_ESTADO_STOCK(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_STOCK_ACTUAL CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE,
    P_STOCK_MINIMO CEMJ_INVENTARIO.STOCK_MINIMO%TYPE,
    P_DIAS NUMBER
)
RETURN VARCHAR2
```

*Línea 5570*

```sql
CEMJ_FN_REP_PRIORIDAD_STOCK(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_STOCK_ACTUAL CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE,
    P_STOCK_MINIMO CEMJ_INVENTARIO.STOCK_MINIMO%TYPE,
    P_DIAS NUMBER
)
RETURN NUMBER
```

*Línea 5594*

```sql
CEMJ_FN_REP_SUG_REPONER(
    P_ID_PRODUCTO CEMJ_PRODUCTO.ID_PRODUCTO%TYPE,
    P_STOCK_ACTUAL CEMJ_INVENTARIO.STOCK_ACTUAL%TYPE,
    P_STOCK_MINIMO CEMJ_INVENTARIO.STOCK_MINIMO%TYPE,
    P_DIAS NUMBER
)
RETURN NUMBER
```

