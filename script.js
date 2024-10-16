

// 1. Utiliza Leaflet para posicionarte en un mapa
function getPosition() {
    let miPromesa = new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                let latitud = position.coords.latitude.toFixed(4);
                let longitud = position.coords.longitude.toFixed(4);

                console.log(`Latitud: ${latitud}\nLongitud: ${longitud}`);
                
                // Resolviendo la promesa con los datos
                resolve({ latitud, longitud });
            }, error => {
                // Rechazar la promesa en caso de error
                reject("Error obteniendo la ubicación");
            });
        } else {
            reject("Tu navegador no soporta Geolocalización");
        }
    });
    return miPromesa;
}

// Usando async/await para obtener los datos
async function pintarDatosPosicion() {
    try {
        let miPosicion = await getPosition();
        console.log(`Latitud: ${miPosicion.latitud}, Longitud: ${miPosicion.longitud}`);
        
        document.getElementById("miPosicion").innerHTML = miPosicion.latitud + ", " +miPosicion.longitud;
        // Crear un mapa en el div con id "map1" usando las coordenadas obtenidas
        var map1 = L.map('map1').setView([miPosicion.latitud, miPosicion.longitud], 15);

        //Agregar capa de OpenStreetMap
        L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map1);

        //Para capa personalizada, se puede usar la libreria leaflet-providers, comentar antes la capa de OpenStreetMap
        L.tileLayer.provider('OpenStreetMap.CH').addTo(map1);

        let cadena = ""
        cadena += `
            <label><strong>Latitud:</strong> </label>${miPosicion.latitud}<br>
            <label><strong>Longitud:</strong> </label>${miPosicion.longitud}
        `;
        // Opcional: agregar un marcador en la posición obtenida
        L.marker([miPosicion.latitud, miPosicion.longitud])
            .addTo(map1)
            .bindPopup(cadena)
            .openPopup();

    } catch (error) {
        console.error(error);
    }
}

// Pintamos los datos
pintarDatosPosicion();

/* *************************************** */
/* *************************************** */
/* *************************************** */

// 2. Dibujar en un mapa las coordenadas de posiciones donde hay terremotos
function getTerremotos(mURL) {

    //const valorURL = url;
    const url = mURL;

    let resultado = fetch(url)
        .then(response => {
            if (!response.ok) {
                // si la respuesta no devuelve un ok
                throw new Error(`API no encontrada: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // devolvemos el objeto.results
            return data.features;
        })
        .catch(error => {
            console.error('Error al conectar:', error);
            const boxMensaje = document.getElementById('mensaje');
            let cadena = "";
            cadena += "Error al conectar con la BB.DD";
            boxMensaje.innerHTML = cadena; // Mensaje de error en el DOM
        });
        return resultado;
}
getTerremotos('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson').then(datos => {
    
    console.log(datos);
    let datosMapa2 = document.getElementById("datosMapa2");
    datosMapa2.innerHTML = `Total de terremotos al día: ${datos.length}`;

    // Segundo mapa
    var map2 = L.map('map2').setView([40.369, -100.383], 4);
    L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map2);

    datos.forEach(item => {
        let magnitud = item.properties.mag; // Obtener la magnitud del terremoto
        const coords = item.geometry.coordinates; // Obtener las coordenadas (longitud, latitud)
        const latLng = [coords[1], coords[0]]; // Leaflet usa lat, long en vez de long, lat

        // Determinar el color del marcador según la magnitud
        let markerColor = getMarkerColors(magnitud);
        let fecha = milisegundosToFecha(item.properties.time);

        let cadena = "";
        cadena += `
            <strong>Título:</strong> <label>${item.properties.title}</label><br>
            <strong>Fecha:</strong> <label>${fecha}</label><br>
            <strong>Ubicación:</strong> <label>${item.properties.place}</label><br>
            <strong>Código:</strong> <label>${item.properties.code}</label><br>
            <strong>Magnitud:</strong> <label>${item.properties.mag}</label>
        `;

        // Crear el marcador y añadirlo al mapa
        L.marker(latLng, { icon: markerColor })
            .bindPopup(cadena)
            .addTo(map2);
    });
});

/* *************************************** */
/* *************************************** */
/* *************************************** */

// 3. Dibujar en un mapa las coordenadas de posiciones donde hay 
//terremotos filtrando por magnitud y por fecha de inicio/fin
// Cargamos el Tercer mapa
var map3 = L.map('map3').setView([40.369, -100.383], 4);
L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map3);

// Asociamos un evento onclick para mostrar los marcadores
let btn_mostrar = document.getElementById("btn_mostrar");
btn_mostrar.addEventListener("click", function (event) {
	event.preventDefault();

    let fInicio = document.getElementById("fInicio");
    let fFin = document.getElementById("fFin");
    
    let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${fInicio.value}&endtime=${fFin.value}&minmagnitude=${magnitud.value}`;
    console.log("url=", url)

    getTerremotos(url).then(datos => {
    
        console.log(datos);
    
        datos.forEach(item => {
            let magnitud = item.properties.mag; // Obtener la magnitud del terremoto
            let fechaInicio = milisegundosToFecha(item.properties.time);
            let fechaFin = milisegundosToFecha(item.properties.updated);

            let coords = item.geometry.coordinates; // Obtener las coordenadas (longitud, latitud)
            let latLng = [coords[1], coords[0]]; // Leaflet usa lat, long

            // Determinar el color del marcador según la magnitud
            let markerColor = getMarkerColors(magnitud);

            //console.log("magnitud=" + magnitud + ", fechaInicio=" + fechaInicio + ", fechaFin=" + fechaFin)
            let cadena = "";
            cadena += `
                <strong>Título:</strong> <label>${item.properties.title}</label><br>
                <strong>Fecha Inicio:</strong> <label>${fechaInicio}</label><br>
                <strong>fecha Fin:</strong> <label>${fechaFin}</label><br>
                <strong>Ubicación:</strong> <label>${item.properties.place}</label><br>
                <strong>Código:</strong> <label>${item.properties.code}</label><br>
                <strong>Magnitud:</strong> <label>${magnitud}</label>
            `;

            // Crear el marcador y añadirlo al mapa
            L.marker(latLng, { icon: markerColor })
                .bindPopup(cadena)
                .addTo(map3);
        });
    });
})

function milisegundosToFecha(msegundos){
    const timestamp = msegundos;
    const date = new Date(timestamp);

    // Extraer componentes de la fecha
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    // Formatear la fecha como "dd/mm/yyyy hh:mm:ss"
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}

function getMarkerColors(valor){

    let markerColor;
    if (valor <= 0.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_gris.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        }); 
    } else if (valor > 1.0 && valor <= 1.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_verde.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    } else if (valor > 2.0 && valor <= 2.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_aceituna.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    } else if (valor > 3.0 && valor <= 3.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_yellow.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    } else if (valor > 4.0 && valor <= 4.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_platano.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    } else if (valor > 5.0 && valor <= 5.9) {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_naranja.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    } else {
        markerColor = L.icon({
            iconUrl: './assets/img/mark_rojo.png',
            iconSize: [30, 30],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: '',
            shadowSize: [41, 41]
        });
    }
    return markerColor;
}