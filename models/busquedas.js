const fs = require('fs')
const axios = require('axios')


class Busquedas {
    
    historial  = []
    dbPath = './db/data.json'

    constructor() {
        this.leerDB()
    }
    
    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'language': 'es'
        } 
    }

    get paramsOpenWether() {
        return {
            'appid': process.env.OPENWETHER_KEY,
            'lang': 'es',
            'units': 'metric',

        }
    }

    get historialCapitalizado() {
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ')
            palabras = palabras.map( p =>  p[0].toUpperCase() + p.substring(1))
            return palabras.join(' ')


        })

        
    }


    async ciudad ( lugar = '' ){
        //petición http

        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            })

            const resp = await instance.get()
           
            return resp.data.features.map ( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))

        } catch (error) {
            return []
        }

    }

    async climaLugar (lat, lon) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWether, lat, lon}
            })

            const resp = await instance.get()
            const { weather, main } = resp.data

            return ({
                temp: main.temp,
                temp_min: main.temp_min,
                temp_max: main.temp_max,
                des: weather[0].description
            })

            
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '' ) {

        if ( this.historial.includes( lugar.toLocaleLowerCase ) ){
            return
        }

        this.historial = this.historial.slice(0,5)

        this.historial.unshift( lugar.toLowerCase() )
        this.guardarDB()

    }

    guardarDB() {

        const payload = {
            historial: this.historial,
        }
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ))
    }

    leerDB() {

        if(!fs.existsSync(this.dbPath) ){
            return null;
        }
        const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'});
        const data = JSON.parse( info )

        this.historial = data.historial
    }

}

module.exports = Busquedas;