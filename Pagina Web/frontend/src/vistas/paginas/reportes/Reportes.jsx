// Pagina: los 3 reportes calculados por la base de datos
import Cabecera from '../../componentes/Cabecera.jsx';
import RankingProductos from './RankingProductos.jsx';
import StockCritico from './StockCritico.jsx';
import VentasPorCanal from './VentasPorCanal.jsx';

export default function Reportes() {
    return (
        <section>
            <Cabecera titulo="Reportes" descripcion="Información estratégica calculada por la base de datos." />
            <RankingProductos />
            <VentasPorCanal />
            <StockCritico />
        </section>
    );
}
