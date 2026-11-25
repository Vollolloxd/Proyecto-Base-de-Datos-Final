// Desplazamiento suave a una seccion de la pagina (enlaces #ancla de la tienda)
export const irASeccion = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
