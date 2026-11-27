#set document(title: "Manual de usuario de Viña La Alborada")
#set page(paper: "a4", margin: (x: 22mm, y: 18mm), numbering: "1")
#set text(lang: "es", size: 10.5pt)
#set par(justify: true)
#set heading(numbering: "1.1")
#show heading.where(level: 1): set text(fill: rgb("#68283e"))
#align(center)[#text(25pt, weight: "bold", fill: rgb("#68283e"))[Viña La Alborada] \
  #text(15pt)[Manual de usuario]]
#outline(title: [Contenido], depth: 2)

#let captura(archivo, leyenda, ancho: 100%) = block(
  breakable: false,
  figure(image("capturas/" + archivo + ".png", width: ancho), caption: leyenda),
)

#let par-capturas(izquierda, derecha) = grid(
  columns: (1fr, 1fr), gutter: 5mm, izquierda, derecha,
)

#pagebreak()

= Iniciar el sistema
Los comandos se ejecutan desde la raíz del proyecto, en terminales separadas según se indica. El entorno local supone que el contenedor `oracle-free` ya existe y que `Backend/.env` apunta a un esquema Oracle con acceso. Para preparar una base demo nueva, ejecutar primero `DB/script.sql` y luego `DB/DATOS_DEMO.sql` con el usuario del esquema. El primer script elimina las tablas existentes de este proyecto, por lo que se usa para inicializar o reiniciar una base descartable.

== Oracle
```sh
podman start oracle-free
```
Esperar hasta que el servicio Oracle acepte conexiones. Si es necesario revisar su arranque, ejecutar `podman logs --tail 80 oracle-free`.

== Backend
```sh
cd Backend
npm ci
npm start
```
`npm ci` se usa para instalar las dependencias si aún no están instaladas. El backend lee `DB_USUARIO`, `DB_CLAVE` y `DB_CONEXION` desde `Backend/.env`. Son credenciales de conexión Oracle. Esperar los mensajes «Conectado a Oracle» y «Servidor listo». El puerto por defecto es 3001 y es el destino del proxy de Vite para `/api`.

== Frontend
```sh
cd Frontend
npm ci
npm run dev
```
Abrir la URL que indica Vite, normalmente `http://localhost:5173`. Mantener ambos procesos abiertos. Como alternativa de ejecución compilada, correr `npm run build` en Frontend y arrancar o reiniciar Express, que sirve `Frontend/dist` desde el puerto 3001.

== Cuentas de prueba
Estas cuentas corresponden a la carga `DB/DATOS_DEMO.sql`. Las contraseñas distinguen mayúsculas y minúsculas.

#table(columns: (1fr, 2.05fr, 1.05fr), inset: 6pt, align: left,
  table.header([Perfil], [Correo], [Contraseña]),
  [Administrador], [`ADMIN@ALBORADA.CL`], [`Alborada2026`],
  [Vendedor 1], [`VENTAS1@ALBORADA.CL`], [`Ventas2026`],
  [Vendedor 2], [`VENTAS2@ALBORADA.CL`], [`Ventas2026`],
  [Cliente web], [`CAMILA.ROJAS@CORREO-DEMO.CL`], [`Cliente2026`],
)

#pagebreak(weak: true)

= Acceso y navegación
== Verificar la edad y entrar

+ Al abrir la tienda, selecciona «Sí, tengo 18 años o más» si corresponde. Si eliges la opción para menores, el sitio bloquea el acceso y permite volver a la pregunta.
+ Pulsa «Iniciar sesión» desde la tienda. Ingresa el correo y la contraseña, y pulsa «Ingresar». El personal entra al panel y el cliente puede volver a la tienda o continuar la acción que inició.
+ Identifica tu perfil en el panel. El menú lateral muestra las opciones disponibles para la cuenta. En una pantalla pequeña, usa «Abrir menú».

#par-capturas(
  captura("verificacion-edad", [Confirmación de edad antes de entrar en la tienda.]),
  captura("inicio-sesion", [Formulario de acceso por correo y contraseña.]),
)

#table(columns: (1.12fr, 2.9fr), inset: 6pt, align: left,
  table.header([Perfil], [Opciones del panel]),
  [Cliente], [Inicio (Mi cuenta), Tienda y Mis pedidos.],
  [Vendedor], [Inicio (Resumen de operaciones), Ventas, Solicitudes web, Inventario, Clientes y Reportes.],
  [Administrador], [Operaciones del vendedor, más Productos, Categorías, Cepas, Usuarios, Métodos de pago y Monitoreo.],
)

#pagebreak(weak: true)

== Cambiar contraseña y cerrar sesión

+ En el menú lateral, pulsa «Cambiar contraseña». Escribe la contraseña actual, la nueva y su confirmación.
+ Pulsa «Guardar contraseña» y revisa el mensaje de confirmación. En el siguiente acceso, ingresa con la contraseña nueva.
+ Para alternar cuentas durante la demostración, pulsa «Cerrar sesión» en el menú lateral y vuelve a iniciar sesión.

#captura("cambiar-contrasena", [Formulario disponible desde el menú del panel.], ancho: 90mm)

#pagebreak(weak: true)

= Tienda
== Explorar la portada y los productos destacados

+ Usa el menú de la tienda para saltar a «Nuestros vinos», «Uva a granel» o «Más vendidos» cuando esas secciones estén disponibles.
+ Abre «Más vendidos» para ver los productos destacados. Revisa el nombre, la presentación y el precio antes de usar «Agregar».

#captura("tienda-portada", [Portada con enlaces al catálogo, a las cuentas y a los pedidos.], ancho: 91%)

#captura("tienda-destacados", [Productos destacados según las ventas registradas.], ancho: 91%)

#pagebreak(weak: true)

== Buscar vinos, consultar uva y agregar al pedido

+ En «Nuestros vinos», escribe el nombre de un producto o una cepa en el buscador. Usa el selector de orden para reorganizar los resultados y limpia la búsqueda para recuperar el listado.
+ Comprueba el formato, la composición, el precio y la disponibilidad en la tarjeta. Selecciona la cantidad correspondiente en botellas o kilos. «Agotado» indica que el producto está sin stock disponible.
+ Pulsa «Agregar» en un producto con stock. Si se abre el aviso de acceso, inicia sesión o crea una cuenta desde allí. Después abre «Mis pedidos» para revisar la línea.

#par-capturas(
  captura("tienda-vinos", [Catálogo de vinos con búsqueda, orden y tarjetas.]),
  captura("tienda-uva", [Catálogo de uva a granel y selección en kilos.]),
)

#captura("tienda-aviso-acceso", [Aviso que aparece al agregar un producto sin una sesión activa.], ancho: 75mm)

#pagebreak(weak: true)

= Cliente web
== Crear una cuenta

+ Pulsa «Crear cuenta» en la tienda o en la página de acceso. Selecciona «Persona» o «Empresa».
+ Para persona natural, escribe nombre y dos apellidos. Para empresa, completa RUT y razón social. Completa el correo, la contraseña y su confirmación. El teléfono es opcional.
+ Pulsa «Crear cuenta». Si el formulario señala un RUT inválido o datos registrados, corrige el campo indicado o ingresa con la cuenta existente.

#par-capturas(
  captura("registro-cliente", [Registro de una persona natural.]),
  captura("registro-empresa", [Registro de una empresa con razón social y RUT.]),
)

#pagebreak(weak: true)

== Revisar Mi cuenta y el historial de pedidos

+ En «Inicio», consulta «Mi cuenta» y usa el enlace a «Mis pedidos» o al catálogo.
+ En «Mis pedidos», localiza el borrador arriba y el historial debajo. Haz clic en una fila del historial para mostrar su detalle sobre la tabla.
+ Usa el folio para identificar el pedido. Revisa los productos, cantidades, subtotales, total y estado.

#captura("cliente-inicio", [Inicio del perfil cliente con accesos a la tienda y sus pedidos.], ancho: 91%)

#captura("cliente-pedido-detalle", [Detalle de una solicitud del historial seleccionado desde su fila.], ancho: 91%)

#pagebreak(weak: true)

== Enviar un producto y consultar su estado
+ En el borrador, editar cantidades y pulsar «Guardar cantidad» cuando se quiera persistir una edición. «Quitar» elimina una línea. «Anular pedido» cancela el borrador completo después de pedir confirmación.
+ Seleccionar un método de pago activo en la fila y pulsar «Enviar producto». Si había varias líneas, la línea enviada pasa a su propia solicitud pendiente y las restantes siguen en el borrador. Si era la única línea, se envía el pedido actual.
+ Consultar el historial por folio. En un pendiente o un aceptado con venta en borrador se puede cambiar la selección con «Guardar método de pago». La selección identifica la forma de pago para el pedido. El envío web no realiza un cobro.
+ Los estados del pedido son borrador (en preparación), pendiente (enviado), aceptado o rechazado (resuelto) y anulado (borrador cancelado). Cuando existe venta asociada, puede aparecer su estado, número y, si hay metadatos de pago, el ID de transacción al confirmarse o anularse la venta.

#captura("cliente-pedido-borrador", [Borrador con cantidad, método de pago y acción «Enviar producto».])

#captura("cliente-pedidos", [Historial para consultar el folio y seguir su estado.], ancho: 88%)

#pagebreak(weak: true)

= Vendedor
== Usar el resumen de operaciones

+ Revisa los indicadores de actividad al entrar al panel. Usa «Ver solicitudes» para pasar al listado de pedidos pendientes o «Ver inventario» para revisar los productos bajo el mínimo.
+ Abre el menú lateral para acceder a Ventas, Solicitudes web, Inventario, Clientes y Reportes. Usa el enlace «Ver tienda» para volver al catálogo.

#captura("vendedor-inicio", [Resumen de operaciones y navegación disponible para el vendedor.])

#pagebreak(weak: true)

== Buscar, crear y actualizar clientes

+ Abre «Clientes» y busca por RUT, correo o nombre. Abre «Editar» si la ficha ya existe.
+ Para crear una ficha, pulsa «Nuevo cliente», elige persona natural o empresa e ingresa sus datos de identidad y contacto. Pulsa «Guardar» y busca la ficha en el listado. Un cliente registrado se puede seleccionar al crear una venta presencial.
+ Usa «Desactivar» para dar de baja una ficha sin solicitudes pendientes. Para recuperarla, marca «Mostrar desactivados» y pulsa «Reactivar».

#captura("clientes-listado", [Buscador de clientes y acciones de administración de fichas.], ancho: 90%)

#par-capturas(
  captura("cliente-nuevo", [Alta de una ficha de cliente.]),
  captura("cliente-editar", [Edición de una ficha existente.]),
)

#pagebreak(weak: true)

== Consultar ventas y crear un borrador presencial

+ En «Ventas», usa el buscador y el filtro «Estado» para localizar una venta. Pulsa su fila para abrir el detalle.
+ Para una venta nueva, pulsa «Nueva venta presencial». Elige «Sin registro (mostrador)» o «Cliente registrado». En mostrador el nombre del comprador es opcional. Para un cliente registrado, busca por RUT, correo o nombre y selecciona la ficha.
+ Escribe el lugar de venta y agrega observaciones si corresponde. Pulsa «Crear venta y agregar productos» para abrir el borrador.

#captura("ventas-listado", [Ventas presenciales y digitales con sus filtros y estados.], ancho: 90%)

#captura("venta-nueva", [Formulario de venta presencial con comprador de mostrador y lugar de venta.], ancho: 90%)

#pagebreak(weak: true)

== Seleccionar productos y confirmar el pago de una venta
+ Dentro del borrador, busca por nombre, código, categoría o formato. En el resultado, revisa presentación, precio y stock. Selecciona el producto, escribe la cantidad y pulsa «Agregar».
+ Revisa las líneas y el total. Al agregar de nuevo el mismo producto, el sistema suma la cantidad y vuelve a verificar el stock.
+ En «Confirmar venta y registrar pago», selecciona un método activo y confirma. Verifica el estado «Confirmada», el pago y el descuento de stock.

#captura("venta-buscar-producto", [Resultados con código, formato, precio y stock disponible.], ancho: 78mm)

#captura("venta-borrador", [Borrador con los controles para agregar y confirmar.], ancho: 92%)

#pagebreak(weak: true)

== Consultar el pago y anular una venta confirmada
+ En «Ventas», filtra por «Confirmada» y pulsa la fila. Revisa el canal, los productos, el total, la fecha y el método de pago.
+ Para revertir la venta, escribe el motivo y pulsa «Anular venta». Lee el diálogo y confirma si corresponde.
+ Verifica el estado «Anulada» y el motivo en el detalle. El pago se conserva en el historial. En «Inventario» → «Movimientos», busca la reversión y verifica que se restituyó el stock.

#captura("venta-detalle", [Venta presencial confirmada y campo para ingresar el motivo.], ancho: 88%)

#captura("venta-anulada", [Ejemplo de una venta digital anulada con fecha, motivo y pago histórico.], ancho: 88%)

#pagebreak(weak: true)

== Consultar o anular solicitudes web
Abre «Solicitudes web», busca el folio y pulsa «Ver detalle». Ver cliente, fecha y estado en el listado, y productos, cantidades, subtotales, total y método cuando se ha elegido uno. «Ver venta N°» aparece si existe una venta vinculada. «Anular solicitud» está disponible en borrador y pendiente. Una solicitud pendiente anulada por el personal queda como rechazada. La versión actual del panel ofrece consulta y anulación. El procedimiento de aceptación está en Oracle y la confirmación del panel se limita a ventas presenciales.

#captura("solicitudes-listado", [Listado con folio, cliente, total, estado y venta vinculada.], ancho: 94%)

#captura("solicitud-detalle", [Detalle de una solicitud web y las acciones disponibles según su estado.], ancho: 92mm)

#pagebreak(weak: true)

== Operar el inventario
+ Abrir «Inventario» y comparar stock y mínimo en «Stock actual». Un producto marcado como bajo mínimo requiere revisar la reposición.
+ En «Movimientos», pulsar «Nuevo movimiento», seleccionar producto y tipo, introducir cantidad y guardar. Usar entrada para incorporar existencias, ajuste positivo para sumar y ajuste negativo para restar. Los ajustes requieren motivo.
+ El registro queda en borrador. Usar «Editar» para corregir, «Anular» para cancelar o «Aplicar» para actualizar el stock. Si el ajuste negativo supera las existencias, reducir la cantidad o verificar el stock antes de aplicar.
+ Consultar el folio, estado y usuario en la tabla. Las salidas y reversiones de venta aparecen automáticamente al confirmar o anular.

#captura("inventario-stock", [Stock actual, umbral mínimo y situación de cada producto activo.], ancho: 92%)

El recorrido de carga de producto muestra el formulario «Nuevo movimiento» con una entrada de 36 botellas.

#pagebreak(weak: true)

== Registrar un ajuste y revisar sus movimientos
+ En «Inventario» → «Movimientos», pulsa «Nuevo movimiento». Selecciona el producto, el tipo de ajuste y la cantidad. Por ejemplo, para descontar dos botellas tras un conteo físico, elige «Ajuste negativo», escribe 2 en «Cantidad» y describe la diferencia en «Motivo».
+ Pulsa «Guardar». Localiza el folio en borrador. Con «Editar» puedes corregir sus datos, con «Anular» puedes cancelar el borrador y con «Aplicar» puedes confirmar el efecto sobre el stock.
+ Verifica que el movimiento pase a «Aplicado» y compara el stock de la ficha con el valor anterior. Para consultar una salida de venta o una reversión, revisa el tipo de movimiento en la misma tabla.

#captura("inventario-ajuste", [Pequeño ajuste negativo con motivo de conteo físico.], ancho: 83mm)

#captura("movimiento-borrador", [Borrador ilustrativo con las acciones «Editar», «Anular» y «Aplicar». Se muestra como ejemplo en el navegador.], ancho: 94%)

#captura("inventario-movimientos", [Historial de entradas, ajustes, salidas y reversiones según el estado.], ancho: 94%)

#pagebreak(weak: true)

== Consultar el ranking mensual de productos

+ Abre «Reportes» y cambia «Mes» en «Productos más y menos vendidos del mes».
+ Compara las posiciones y las unidades vendidas. Abre «Ver tabla» para leer montos, participaciones y clasificación por producto.

#captura("reporte-ranking", [Ranking para el mes seleccionado.])

#captura("reporte-ranking-tabla", [Detalle tabular del ranking mensual.], ancho: 92%)

#pagebreak(weak: true)

== Comparar las ventas por canal

+ En «Ventas mensuales por canal», selecciona el año. Compara presencial y digital en el gráfico y revisa los totales del período.
+ Abre «Ver tabla» para ver ventas confirmadas y anuladas por mes, monto, ticket promedio y participación de cada canal.

#captura("reporte-canales", [Comparación mensual de los canales presencial y digital.])

#captura("reporte-canales-tabla", [Detalle mensual por canal.], ancho: 92%)

#pagebreak(weak: true)

== Revisar el stock crítico y planificar la reposición

+ En «Stock crítico y reposición», selecciona 7, 30 o 90 días. Marca la casilla de alertas para concentrarte en productos que requieren revisión.
+ Compara stock y mínimo, demanda del período, días de cobertura y la cantidad sugerida en «Reponer». Busca el producto en Inventario si necesitas consultar sus movimientos o registrar una entrada.

#captura("reporte-stock", [Período, filtro de alertas y cantidades sugeridas por producto.])

#pagebreak(weak: true)

= Administrador
== Navegar por los mantenedores

Además de las operaciones del vendedor, el menú de administrador da acceso a Productos, Categorías, Cepas, Usuarios, Métodos de pago y Monitoreo.

+ En los mantenedores, busca primero el registro. Pulsa el botón de alta para crear uno o «Editar» en la fila para actualizarlo. Guarda y verifica el resultado en el listado.
+ Si el módulo ofrece «Mostrar desactivados», márcalo para encontrar un registro inactivo. En categorías, cepas y clientes puedes recuperarlo con «Reactivar».

#captura("admin-inicio", [Menú del administrador con módulos de operaciones, mantenedores y monitoreo.])

#pagebreak(weak: true)

== Administrar categorías

+ Abre «Categorías» y pulsa «Nueva categoría». Escribe un nombre, selecciona «Botella» o «Kg» como unidad de medida y agrega una descripción si corresponde. Guarda y localiza el nombre en la tabla.
+ Usa «Editar» para modificar la ficha. Una categoría con productos asociados conserva su unidad de medida. Para desactivar la categoría, primero verifica que carezca de productos activos.

#captura("categorias-listado", [Categorías con su unidad de medida y acciones por fila.], ancho: 91%)

#par-capturas(
  captura("categoria-nueva", [Alta con unidad de medida.]),
  captura("categoria-editar", [Edición de una categoría.]),
)

#pagebreak(weak: true)

== Administrar cepas

+ Abre «Cepas» y pulsa «Nueva cepa». Ingresa el nombre y una descripción opcional, guarda y busca la nueva cepa en el listado.
+ Si necesitas desactivar una cepa, revisa primero en qué productos activos participa. Después de reactivar una cepa, vuelve al formulario de producto para seleccionarla.

#captura("cepas-listado", [Listado de cepas y acciones para editarlas o desactivarlas.], ancho: 91%)

#par-capturas(
  captura("cepa-nueva", [Alta de una variedad.]),
  captura("cepa-editar", [Edición de una variedad.]),
)

#pagebreak(weak: true)

== Consultar productos y su composición

+ En «Productos», busca por código o nombre y revisa el estado y la columna «Stock / mínimo». Usa «Editar» para cambiar los datos generales de una ficha.
+ Pulsa «Cepas» en la fila para consultar los porcentajes. Para modificar una composición, desactiva primero la ficha. Revisa el procedimiento de corrección al final del recorrido ilustrado.

#captura("productos-listado", [Listado de productos con estado y acceso a la composición.])

#par-capturas(
  captura("producto-editar", [Edición de los datos de la ficha y su estado.]),
  captura("producto-composicion", [Cepa y porcentaje de una ficha existente.]),
)

#pagebreak(weak: true)

== Cargar un producto y dejarlo disponible en la tienda
Este recorrido usa una cuenta de administrador y las categorías y cepas de la base demo. El ejemplo termina con un vino activo y 36 botellas disponibles. En una base de prueba, usa un código distinto si el del ejemplo ya existe.

=== Preparar la categoría y las cepas
+ Abre «Categorías» y verifica que «Vinos» esté activa y tenga unidad de medida «Botella». Si falta, créala. Para uva a granel, usa una categoría activa con unidad «Kg».
+ En «Cepas», localiza «Cabernet Sauvignon» y «Merlot». Si una está desactivada, marca «Mostrar desactivados» y pulsa «Reactivar». Si falta, créala antes de abrir el formulario del producto.

=== Crear la ficha y completar la composición
Abre «Productos» → «Nuevo producto» y completa la ficha con los datos de la tabla.

#grid(
  columns: (1fr, 80mm),
  gutter: 5mm,
  table(columns: (1fr, 1.35fr), inset: 3pt, align: left,
    table.header([Campo], [Valor del ejemplo]),
    [Código], [`VT-ENS-DEMO-2026`],
    [Categoría], [Vinos],
    [Nombre], [Ensamblaje de cosecha],
    [Añada], [2026],
    [Precio (CLP)], [8990 por botella],
    [Stock mínimo], [12 botellas],
    [Descripción], [Ensamblaje tinto de Cabernet Sauvignon y Merlot.],
    [Volumen / Unidad], [750 / ml],
  ),
  figure(
    image("capturas/nuevo-producto.png", width: 100%),
    caption: [«Nuevo producto» con dos cepas y una composición al 100%.],
  ),
)

+ La *añada es opcional*. Si la ingresas, usa un año de cosecha entre 1900 y el año en curso, inclusive. En 2026, el límite es 2026 y una añada 2027 se rechaza. El límite avanza cada año.
+ En «Composición de cepas», elige «Cabernet Sauvignon» y escribe 70 en «Porcentaje». Pulsa «Agregar cepa», elige «Merlot» y verifica que tenga 30. Revisa que el formulario muestre «Total 100%».
+ Pulsa «Guardar y activar». Busca el código en «Productos» y verifica que la ficha esté activa y que «Stock / mínimo» muestre 0 / 12. El mínimo sirve como umbral de alerta. Una ficha activa sin existencias ya puede aparecer en la tienda como «Agotado».
+ Para cargar uva a granel, usa «Uva», ingresa el precio por kilo y define el formato con peso y unidad. Por ejemplo, 1 y kg. El formulario asigna 100% a la única cepa seleccionada. Las cantidades de inventario se expresan en kilos.

#pagebreak(weak: true)
=== Cargar y aplicar las existencias
#grid(
  columns: (1fr, 82mm),
  gutter: 5mm,
  [
    + Abre «Inventario». En «Movimientos», pulsa «Nuevo movimiento» y selecciona el producto por código. Usa tipo «Entrada», ingresa cantidad 36 y pulsa «Guardar». El motivo es opcional para una entrada.
    + Localiza el movimiento por producto o folio. Mientras figure como «Borrador», el stock sigue en 0. Si la cantidad requiere un cambio, usa «Editar».
    + Pulsa «Aplicar» y confirma el folio en el diálogo. Verifica que el movimiento quede «Aplicado» y que en «Stock actual» el producto muestre 36 de stock, 12 de mínimo y situación «OK».
  ],
  figure(
    image("capturas/entrada-inventario.png", width: 100%),
    caption: [Entrada de 36 botellas en un vino de la base demo. Para el ejercicio, selecciona la ficha recién creada.],
  ),
)

=== Comprobar la ficha en la tienda
+ Abre la tienda y busca «Ensamblaje de cosecha» en «Nuestros vinos». Comprueba que el precio sea 8.990 CLP y que se pueda elegir cantidad y agregar el producto. Para uva a granel, usa «Uva a granel».
+ Si la ficha aparece como «Agotado», comprueba que la entrada esté aplicada y que el stock sea positivo. Si la ficha no aparece, verifica que el producto esté activo y que lo estés buscando en la sección de su categoría.

=== Corregir una composición o completar un alta parcial
+ Si «Guardar y activar» muestra un aviso después de crear la ficha, busca el código en «Productos», habilitando «Mostrar desactivados» si hace falta. Abre «Cepas» en la fila para ver qué porcentajes se guardaron y completar los faltantes.
+ Para cambiar la composición de una ficha activa, pulsa «Desactivar» antes de abrir «Cepas». Agrega, edita o quita las filas necesarias. Cuando todas las cepas estén activas y la composición sume 100%, vuelve al listado, pulsa «Activar» y verifica la ficha en la tienda.

#pagebreak(weak: true)

== Administrar usuarios

+ En «Usuarios», pulsa «Nuevo usuario». Completa correo, perfil y una contraseña de al menos seis caracteres. Si eliges el perfil Cliente, selecciona su ficha asociada.
+ Pulsa «Guardar» y comprueba el correo, perfil y estado en la tabla. Usa «Editar» para cambiar el perfil o habilitar o deshabilitar la cuenta con «Activo». Deja vacía «Nueva contraseña» para conservar la actual.

#captura("usuarios-listado", [Listado de cuentas y perfiles de la base demo.], ancho: 91%)

#par-capturas(
  captura("usuario-nuevo", [Alta con perfil y estado de la cuenta.]),
  captura("usuario-editar", [Edición con cambio opcional de contraseña.]),
)

#pagebreak(weak: true)

== Administrar métodos de pago

+ En «Métodos de pago», pulsa «Nuevo método» e ingresa el nombre y una descripción opcional. Marca «Activo» para habilitarlo y guarda.
+ Busca el método en la tabla. Usa «Editar» para cambiar el estado. Comprueba que los métodos activos aparezcan en las opciones de un pedido o de una venta nueva.

#captura("metodos-pago-listado", [Listado de métodos de pago y sus estados.], ancho: 91%)

#par-capturas(
  captura("metodo-nuevo", [Alta y activación de un método.]),
  captura("metodo-editar", [Edición de un método existente.]),
)

#pagebreak(weak: true)

== Monitorear la auditoría de cambios

+ Abre «Monitoreo» → «Auditoría de cambios». Selecciona el período y la tabla, por ejemplo productos o ventas.
+ Localiza la operación y lee su fecha, responsable, registro y detalle. Para la demostración, busca el cambio por el ID del producto o de la venta que acabas de registrar.

#captura("monitoreo-auditoria", [Auditoría con filtros por período y tabla.])

#pagebreak(weak: true)

== Consultar alertas de stock

+ Abre la pestaña «Alertas de stock» y ajusta el período. Marca «Solo productos que hoy siguen bajo el mínimo» para filtrar por la situación actual. Si la tabla está vacía, amplía el período o desmarca la casilla. Localiza el producto y distingue la caída bajo el mínimo de un evento de reposición.
+ Abre «Inventario» para comparar el evento con el stock actual. El historial permite saber cuándo cambió la situación del producto.

#captura("monitoreo-alertas", [Pestaña de alertas, selector de período y filtro por situación actual.])

#pagebreak(weak: true)

== Consultar intentos de inicio de sesión

+ Abre «Intentos de inicio de sesión», selecciona el período y revisa fecha, cuenta y resultado. Usa el filtro de fallos para investigar un bloqueo.
+ Después de cinco fallos de credenciales en la ventana de 15 minutos, espera a que venza el bloqueo y vuelve a ingresar con la contraseña correcta.

#captura("monitoreo-accesos", [Historial de accesos de las cuentas de demostración.])

#pagebreak(weak: true)

= Demostración y resolución de problemas
+ *Cliente.* Agregar un producto con stock, enviarlo y anotar el folio.
+ *Vendedor.* Localizar el folio en Solicitudes web. Crear, confirmar y anular una venta presencial de prueba. Verificar en Inventario la diferencia de stock y la reversión.
+ *Administrador.* Completar la carga de un producto y comprobar el stock en la tienda. Abrir Monitoreo y localizar la venta y los movimientos. Consultar los reportes del mes y del año de carga. Mostrar el estado bajo mínimo con los productos de la carga demo.

Si la tienda no carga productos, revisar que Oracle y Express estén activos y que se haya cargado la demo. Si Vite muestra un error de proxy, comprobar que el backend escucha en el puerto 3001. Si faltan módulos, verificar la cuenta y volver a iniciar sesión. Si faltan métodos de pago, pedir al administrador que revise si hay alguno activo. Si se rechaza una confirmación por stock insuficiente, comprobar existencias en Inventario antes de repetirla.
