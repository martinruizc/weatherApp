require('dotenv').config()
const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {
    let opt;
    const busqueda = new Busquedas()

    do {
        opt = await inquirerMenu();
        
        switch( opt ) {
            case 1:
                //Mostrar Mensaje
                const termino = await leerInput('Ciudad: ')

                //Buscar Lugares
                const lugares = await busqueda.ciudad( termino );

                //Seleccionar el lugar
                const idSeleccionado = await listarLugares(lugares)
                if (idSeleccionado === '0') continue;

                const lugarSel = lugares.find( l => l.id == idSeleccionado )

                //Guardar en DB
                busqueda.agregarHistorial(lugarSel.nombre)
            
                const {temp, temp_min, temp_max, des} = await busqueda.climaLugar(lugarSel.lat, lugarSel.lng)

                console.clear()
                console.log('\nInformación del lugar\n'.green);
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', temp );
                console.log('Mínima:', temp_min);
                console.log('Máxima:', temp_max);
                console.log('Cómo está el clima:', des);

            break;
            case 2: 
            busqueda.historialCapitalizado.forEach( ( lugar, i ) => {
                const idx = `${i + 1 }`.green
                console.log(`${idx} ${lugar}` );
                    
            })

            break;

        }

        if (opt !== 0 ) await pausa();

    } while (opt !== 0);


}

main()