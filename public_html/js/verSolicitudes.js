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

    cargarSolicitudes(usuario);
});

function cargarSolicitudes(usuario) {
    const req = indexedDB.open("VitoBadi14");
    req.onsuccess = (e) => {
        const db = e.target.result;
        // Necesitamos 3 tablas
        const tx = db.transaction(["Habitacion", "Solicitud", "Usuario"], "readonly");
        
        Promise.all([
            getAll(tx.objectStore("Habitacion")),
            getAll(tx.objectStore("Solicitud")),
            getAll(tx.objectStore("Usuario"))
        ]).then(([habitaciones, solicitudes, usuarios]) => {
            renderizar(usuario, habitaciones, solicitudes, usuarios);
        });
    };
}

function getAll(store) {
    return new Promise(resolve => store.getAll().onsuccess = e => resolve(e.target.result));
}

function renderizar(usuario, habitaciones, solicitudes, usuarios) {
    const contenedor = document.getElementById("resultados");
    const titulo = document.getElementById("tituloPagina");
    contenedor.innerHTML = "";

    const misHabitaciones = habitaciones.filter(h => h.emailPropietario === usuario.email);
    const esPropietario = misHabitaciones.length > 0;

    let lista = [];

    if (esPropietario) {
        titulo.textContent = "Solicitudes Recibidas";
        const misIds = misHabitaciones.map(h => h.idhabitacion);
        // Solicitudes para mis habitaciones
        lista = solicitudes.filter(s => misIds.includes(s.idhabitacion));
    } else {
        titulo.textContent = "Mis Solicitudes Enviadas";
        // Solicitudes hechas por mí
        lista = solicitudes.filter(s => s.emailInquilinoPosible === usuario.email);
    }

    if (lista.length === 0) {
        contenedor.innerHTML = "<h3>No hay solicitudes.</h3>";
        return;
    }

    lista.forEach(sol => {
        const hab = habitaciones.find(h => h.idhabitacion === sol.idhabitacion);
        if(!hab) return;

        const card = document.createElement("div");
        card.className = "card";
        
        let htmlBase = `
            <div class="imagen-container"><img class="hab-imagen" src="${hab.imagen}"></div>
            <p><strong>Dirección:</strong> ${hab.direccion}</p>
            <p><strong>Precio:</strong> ${hab.precio} €</p>
        `;

        if (esPropietario) {
            // Botón especial para ver quién solicita (Requisito 50)
            htmlBase += `<button class="btn-detalle" style="background:#4e60dd; color:white; padding:8px; border:none; border-radius:5px; cursor:pointer; margin-top:10px;">Ver posible inquilino</button>`;
        } else {
            htmlBase += `<p><strong>Propietario:</strong> ${hab.emailPropietario}</p>`;
        }

        card.innerHTML = htmlBase;

        // Funcionalidad del botón para el propietario
        if (esPropietario) {
            const btn = card.querySelector(".btn-detalle");
            btn.addEventListener("click", () => {
                const inquilino = usuarios.find(u => u.email === sol.emailInquilinoPosible);
                if (inquilino) {
                    // Podrías hacer un modal, pero un alert detallado es suficiente para cumplir
                    alert(`Detalles del Inquilino:\n\nNombre: ${inquilino.nombre}\nEmail: ${inquilino.email}`);
                } else {
                    alert("Usuario no encontrado");
                }
            });
        }

        contenedor.appendChild(card);
    });
}
