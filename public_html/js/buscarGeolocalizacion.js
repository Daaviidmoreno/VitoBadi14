/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuario) { window.location.href = "login.html"; return; }

    document.getElementById("btnAtras").addEventListener("click", () => window.location.href = "principal.html");
    document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "buscarHabitacionNoLogueado.html";
    });

    document.getElementById("btnBuscar").addEventListener("click", realizarBusqueda);
});

// 1. Función para obtener coordenadas de una dirección (API Nominatim)
async function obtenerCoords(direccion) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (e) { console.error(e); }
    return null;
}

// 2. Fórmula de Haversine para distancia en KM
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function realizarBusqueda() {
    const dir = document.getElementById("direccionInput").value;
    const radio = parseFloat(document.querySelector('input[name="radio"]:checked').value);
    const status = document.getElementById("statusBusqueda");
    const lista = document.getElementById("listaResultados");

    if (!dir) { alert("Escribe una dirección"); return; }

    status.textContent = "Obteniendo coordenadas...";
    lista.innerHTML = "";

    // Paso 1: Geocodificar dirección origen
    const coordsOrigen = await obtenerCoords(dir);
    
    if (!coordsOrigen) {
        status.textContent = "Dirección no encontrada.";
        return;
    }

    status.textContent = `Buscando en ${radio} km alrededor de: ${dir}`;

    // Paso 2: Obtener habitaciones y filtrar por distancia
    const req = indexedDB.open("VitoBadi14");
    req.onsuccess = (e) => {
        const db = e.target.result;
        // Necesitamos Habitaciones y Alquileres (para saber fecha fin)
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");
        
        Promise.all([
            new Promise(r => tx.objectStore("Habitacion").getAll().onsuccess = ev => r(ev.target.result)),
            new Promise(r => tx.objectStore("Alquiler").getAll().onsuccess = ev => r(ev.target.result))
        ]).then(([habitaciones, alquileres]) => {
            
            const resultados = [];

            habitaciones.forEach(hab => {
                if (hab.latitud && hab.longitud) {
                    const dist = calcularDistancia(coordsOrigen.lat, coordsOrigen.lon, hab.latitud, hab.longitud);
                    
                    if (dist <= radio) {
                        // Buscar fecha fin de alquiler
                        const alq = alquileres.find(a => a.idhabitacion === hab.idhabitacion);
                        // Si tiene alquiler activo, cogemos la fecha, si no "Disponible"
                        // Simplificación: tomamos el último alquiler encontrado o disponible
                        const fechaFin = alq ? alq.fechaFin : "Disponible ahora";

                        hab.distanciaReal = dist;
                        hab.fechaFinInfo = fechaFin;
                        resultados.push(hab);
                    }
                }
            });

            // Ordenar por distancia
            resultados.sort((a, b) => a.distanciaReal - b.distanciaReal);
            mostrarResultados(resultados, lista);
        });
    };
}

function mostrarResultados(resultados, contenedor) {
    if (resultados.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron habitaciones en ese rango.</p>";
        return;
    }

    resultados.forEach(hab => {
        const div = document.createElement("div");
        div.className = "marcador";
        div.innerHTML = `
            <h3 style="margin:0 0 5px 0;">${hab.direccion}</h3>
            <p><strong>Distancia:</strong> ${hab.distanciaReal.toFixed(2)} km</p>
            <p style="color:#666; font-size:0.9em;">Clic para ver detalle</p>
        `;

        // Requisito 33: Al clicar, mostrar precio y fecha final alquiler
        div.addEventListener("click", () => {
            alert(`Detalle de Habitación:\n\nPrecio: ${hab.precio} €\nFecha fin alquiler: ${hab.fechaFinInfo}`);
        });

        contenedor.appendChild(div);
    });
}