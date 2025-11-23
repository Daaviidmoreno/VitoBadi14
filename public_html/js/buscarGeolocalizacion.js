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

    document.getElementById("btnBuscar").addEventListener("click", iniciarBusqueda);
});

// --- FÓRMULA DE HAVERSINE (Distancia en KM) ---
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

// --- OBTENER COORDENADAS (Nominatim) ---
async function geocodificar(direccion) {
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

async function iniciarBusqueda() {
    const dir = document.getElementById("direccionInput").value;
    const radio = parseFloat(document.querySelector('input[name="radio"]:checked').value);
    const estado = document.getElementById("estadoBusqueda");
    const mapa = document.getElementById("mapaSimulado");
    
    // Limpiar marcadores previos (dejar solo el punto central)
    mapa.innerHTML = '<div class="punto-central" title="Tu ubicación"></div>';

    if (!dir) { alert("Introduce una dirección"); return; }

    estado.textContent = "Ubicando dirección...";
    const centro = await geocodificar(dir);

    if (!centro) {
        estado.textContent = "Dirección no encontrada.";
        return;
    }

    estado.textContent = `Buscando en ${radio} km alrededor de: ${dir}`;

    // Consultar BD
    const req = indexedDB.open("VitoBadi14");
    req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(["Habitacion", "Alquiler"], "readonly");

        Promise.all([
            getAll(tx.objectStore("Habitacion")),
            getAll(tx.objectStore("Alquiler"))
        ]).then(([habitaciones, alquileres]) => {
            
            let encontrados = 0;

            habitaciones.forEach(hab => {
                if (hab.latitud && hab.longitud) {
                    const dist = calcularDistancia(centro.lat, centro.lon, hab.latitud, hab.longitud);
                    
                    if (dist <= radio) {
                        encontrados++;
                        // Buscar fecha fin alquiler
                        const alq = alquileres.find(a => a.idhabitacion === hab.idhabitacion);
                        const fechaFin = alq ? alq.fechaFin : "Disponible";

                        agregarMarcador(mapa, hab, dist, radio, fechaFin);
                    }
                }
            });

            if (encontrados === 0) estado.textContent = "No hay habitaciones en ese radio.";
        });
    };
}

function getAll(store) {
    return new Promise(r => store.getAll().onsuccess = ev => r(ev.target.result));
}

function agregarMarcador(mapa, hab, dist, radioMax, fechaFin) {
    const marcador = document.createElement("div");
    marcador.className = "marcador-habitacion";
    
    // Posicionamiento simulado en el div (centro 50%, dispersión relativa al radio)
    // Esto es una aproximación visual simple
    const offsetX = (Math.random() - 0.5) * (dist / radioMax) * 80; 
    const offsetY = (Math.random() - 0.5) * (dist / radioMax) * 80;
    
    marcador.style.left = `calc(50% + ${offsetX}%)`;
    marcador.style.top = `calc(50% + ${offsetY}%)`;

    // Evento Click (Requisito 34: Precio y Fecha Fin)
    marcador.addEventListener("click", () => {
        alert(`🏠 ${hab.direccion}\n💰 Precio: ${hab.precio} €\n📅 Fin Alquiler: ${fechaFin}\n📏 Distancia: ${dist.toFixed(2)} km`);
    });

    mapa.appendChild(marcador);
}