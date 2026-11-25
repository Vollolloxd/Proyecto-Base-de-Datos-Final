// Vista: foto del viñedo de la portada con degradados de legibilidad
export default function FotoVinedo({ clase }) {
    return (
        <div aria-hidden="true" className={clase}>
            <img src="/img/vinedo.jpg" alt="" className="h-full w-full animate-revelar-foto object-cover [animation-delay:60ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent lg:bg-gradient-to-r lg:from-carbon lg:via-carbon/10" />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-carbon/80 to-transparent" />
        </div>
    );
}
