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

    cargarAlquileres(usuario);
});

function cargarAlquileres(usuario) {
    const req = indexedDB.open("VitoBadi14");

    req.onsuccess = (e) => {
        const db = e.target.result;
        
        // Traemos Habitaciones y Alquileres para cruzar datos
        Promise.all([
            getAll(db, "Habitacion"),
            getAll(db, "Alquiler")
        ]).then(([habitaciones, alquileres]) => {
            renderizar(usuario, habitaciones, alquileres);
        });
    };
}

function getAll(db, storeName) {
    return new Promise(resolve => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        store.getAll().onsuccess = e => resolve(e.target.result);
    });
}

function renderizar(usuario, habitaciones, alquileres) {
    const contenedor = document.getElementById("resultados");
    const titulo = document.getElementById("tituloPagina");
    const template = document.getElementById("templateAlquiler");
    contenedor.innerHTML = "";

    // Verificar si es propietario (tiene habitaciones a su nombre)
    const misHabitaciones = habitaciones.filter(h => h.emailPropietario === usuario.email);
    const esPropietario = misHabitaciones.length > 0;

    let listaAMostrar = [];

    if (esPropietario) {
        titulo.textContent = "Alquileres en mis Propiedades";
        const misIds = misHabitaciones.map(h => h.idhabitacion);
        
        // Alquileres asociados a mis habitaciones
        listaAMostrar = alquileres.filter(a => misIds.includes(a.idhabitacion));
    } else {
        titulo.textContent = "Mis Alquileres (Inquilino)";
        // Alquileres donde yo soy el inquilino
        listaAMostrar = alquileres.filter(a => a.emailInquilino === usuario.email);
    }

    if (listaAMostrar.length === 0) {
        contenedor.innerHTML = "<h3>No hay alquileres registrados.</h3>";
        return;
    }

    // Ordenar por fecha fin (Requisito 48)
    listaAMostrar.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

    listaAMostrar.forEach(alq => {
        const habitacion = habitaciones.find(h => h.idhabitacion === alq.idhabitacion);
        if (!habitacion) return;

        const clone = template.content.cloneNode(true);
        
        clone.querySelector(".hab-imagen").src = habitacion.imagen || "img/noFoto.png";
        clone.querySelector(".alq-direccion").textContent = habitacion.direccion;
        clone.querySelector(".alq-precio").textContent = habitacion.precio;
        clone.querySelector(".alq-ini").textContent = alq.fechaInicio;
        clone.querySelector(".alq-fin").textContent = alq.fechaFin;

        if (esPropietario) {
            clone.querySelector(".alq-extra").textContent = "Inquilino: " + alq.emailInquilino;
        } else {
            clone.querySelector(".alq-extra").textContent = "Propietario: " + habitacion.emailPropietario;
        }

        contenedor.appendChild(clone);
    });
}