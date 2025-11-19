//  DOM
const grid = document.querySelector('#grid-videogames'); // lugar donde se veran los juegos
const estadoCarga = document.querySelector('#estado-de-carga'); // Mensaje de "Cargando..."
const mensajeError = document.querySelector('#mensaje-de-error'); // Mensaje de error cuando no hay resultados
const inputBusqueda = document.querySelector('#input-busqueda'); // texto para buscar juegos
const btnBuscar = document.querySelector('#btn-buscar'); // Botón de búsqueda
const selectPlataforma = document.querySelector('#select-plataforma'); // filtrar por plataforma (PC, PS5, Xbox, etc)
const selectOrdenar = document.querySelector('#select-ordenar'); // Sección para ordenar (rating, reciente, nombre)
const btnVerMas = document.querySelector('#btn-ver-mas'); // Botón para cargar más juegos
const modalDetalles = document.querySelector('#modal-detalles'); // ventana donde se muestran los detalles del juego seleccionado
const btnCerrarModal = document.querySelector('#btn-cerrar-modal'); // Botón X para cerrar la ventana de detalles

//  Variables 
let paginaActual = 0; // Controla qué página de juegos estamos mostrando
const juegosPorPagina = 12; // Cantidad de juegos por página
let juegosEnCache = []; // Almacena todos los juegos cargados de la API
let juegosActuales = []; // Almacena los juegos después de aplicar filtros
let busquedaActiva = false; // Bandera para saber si hay búsqueda activa

// RENDERIZAR VIDEOJUEGOS
function renderizarVideojuegos(lista) {
    if (!grid) {
        console.error('Grid no encontrado');
        return;
    }
    
    lista.forEach((juego) => {
        //Ajusta los nombres de las propiedades según la API//
        const titulo = juego.title || juego.external || "Juego";
        const thumb = juego.thumb || juego.thumbnail || "";

        //Precios y descuentos//
        const normal = juego.normalPrice ?? "_";
        const oferta = juego.salePrice ?? juego.cheapest ?? "_";

        //Descuento si existe o null si no//
        const ahorro = juego.savings ? Math.round(juego.savings) : null;

        //html de la card//
        const card = document.createElement('article');
        card.className = 'bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col';

        // Estilos Tailwind//
        card.innerHTML = `
            <img
              src="${thumb}"
              alt="${titulo}"
              class="h-40 w-full object-cover"
            />
            <div class="p-4 flex flex-col gap-2 flex-1">
                <h3 class="text-md font-semibold text-slate-900">${titulo}</h3>

                <p class="text-xs text-slate-500">
                  precio:${
                    normal && normal !== "_" ? ` <s>$${normal}</s>` : ""
                  }
                  ${
                    oferta && oferta !== "_" ? ` . <span class="font-bold text-green-900">$${oferta}</span>` : ""
                  }
                  ${ahorro ? ` . Ahorra ${ahorro}%` : ""}
                </p>
                  

                <p class="text-sm text-slate-600 flex-1">${juego.descripcion || ""}</p>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-yellow-500 font-semibold">⭐ ${juego.rating || "N/A"}</span>
                    <button class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">Ver detalles</button>
                </div>
            </div>
        `;
        //funcion para abrir la ventana de detalles//
        const btnDetalles = card.querySelector('button');
        btnDetalles.addEventListener('click', () => abrirModal(juego));

        //Agrega la card al grid//
        grid.appendChild(card);
    });
}
// CARGAR VIDEOJUEGOS INICIALES
async function cargarVideojuegosInicial() {
    estadoCarga.classList.remove("hidden"); // Muestra "Cargando..."
    mensajeError.classList.add("hidden"); // Oculta mensajes de error previos
    grid.innerHTML = ''; // Limpia el grid anterior
    paginaActual = 0; // Reinicia el contador de páginas
    juegosEnCache = []; // Vacía el caché
    busquedaActiva = false;
    
    try {
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=0`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json(); // Da formato JSON a la respuesta de la API
        juegosEnCache = data; // Almacena todos en caché
        juegosActuales = data;
        // muestra los primeros 12 juegos 
        renderizarVideojuegos(data.slice(0, juegosPorPagina));
        paginaActual++;
    }
    catch (e) {
        console.error("Error al cargar Cheapshark", e);
        mensajeError.textContent = "Error al cargar los juegos. Intenta más tarde.";
        mensajeError.classList.remove('hidden');
    }
    finally {
        estadoCarga.classList.add('hidden'); // Oculta el mensaje de carga
    }
}

cargarVideojuegosInicial();
