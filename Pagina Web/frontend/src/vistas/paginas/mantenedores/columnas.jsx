// Columnas compartidas por los mantenedores
import { InsigniaActivo } from '../../componentes/Insignia.jsx';

export const colActivo = { campo: 'ACTIVO', titulo: 'Estado', render: (f) => <InsigniaActivo valor={f.ACTIVO} /> };
