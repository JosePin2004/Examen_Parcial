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
//Función para filtrar por búsqueda y plataforma//
function aplicarFiltros() {
    const termino = inputBusqueda.value.toLowerCase(); // Obtiene el término de búsqueda en minúsculas
    const plataforma = selectPlataforma.value; // Obtiene la plataforma seleccionada
    
    // Filtra juegos que coincidan con el término de búsqueda
    let resultados = juegosEnCache.filter(juego => {
        const titulo = (juego.title || juego.external || "").toLowerCase();
        const cumpleBusqueda = titulo.includes(termino) || termino === ""; // Si está vacío, acepta todos
        return cumpleBusqueda;
    });
    
    // Aplica ordenamiento según la opción seleccionada
    const ordenar = selectOrdenar.value;
    if (ordenar === "rating") {
        // Ordena de mayor a menor puntuación (Metacritic)
        resultados.sort((a, b) => (b.metacriticScore || 0) - (a.metacriticScore || 0));
    } else if (ordenar === "recent") {
        // Ordena por fecha de lanzamiento (más recientes primero)
        resultados.sort((a, b) => (b.steamReleaseDate || 0) - (a.steamReleaseDate || 0));
    } else if (ordenar === "name") {
        // Ordena alfabéticamente por nombre
        resultados.sort((a, b) => (a.title || a.external || "").localeCompare(b.title || b.external || ""));
    }
    
    juegosActuales = resultados; // Guarda los resultados filtrados
    return resultados;
}


//Función para abrir ventana con detalles//
function abrirModal(juego) {
    // Extrae la información del juego con valores por defecto
    const titulo = juego.title || juego.external || "Juego";
    const thumb = juego.thumb || juego.thumbnail || "";
    const normal = juego.normalPrice ?? "-";
    const oferta = juego.salePrice ?? juego.cheapest ?? "-";
    const ahorro = juego.savings ? Math.round(juego.savings) : "-";
    
    // Rellena la ventana con la información del juego
    document.querySelector('#modal-titulo').textContent = titulo; // Título del juego
    document.querySelector('#modal-imagen').src = thumb; // Imagen del juego
    document.querySelector('#modal-imagen').alt = titulo;
    document.querySelector('#modal-precio-normal').textContent = normal !== "-" ? `$${normal}` : "No disponible";
    document.querySelector('#modal-precio-oferta').textContent = oferta !== "-" ? `$${oferta}` : "No disponible";
    document.querySelector('#modal-ahorro').textContent = ahorro !== "-" ? `${ahorro}%` : "No disponible";
    
    // Construye el enlace a la tienda 
    let enlaceURL = `https://www.cheapshark.com/search?q=${encodeURIComponent(titulo)}`;
    
    document.querySelector('#modal-enlace-tienda').href = enlaceURL;
    
    // Muestra el modal eliminando la clase "hidden"
    modalDetalles.classList.remove('hidden');
}


//Función para cerrar ventana//
function cerrarModal() {
    modalDetalles.classList.add('hidden');
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

// BÚSQUEDA
function ejecutarBusqueda() {
    estadoCarga.classList.remove("hidden");
    grid.innerHTML = ''; // Limpia los resultados previos
    
    // Aplica los filtros (búsqueda + ordenamiento)
    const resultados = aplicarFiltros();
    
    // Verifica si hay resultados
    if (resultados.length === 0) {
        mensajeError.textContent = "No se encontraron videojuegos con ese criterio.";
        mensajeError.classList.remove('hidden');
    } else {
        mensajeError.classList.add('hidden');
        // Renderiza los juegos encontrados
        renderizarVideojuegos(resultados);
    }
    
    estadoCarga.classList.add('hidden');
}



//Cargar más juegos//
async function cargarMasJuegos() {
    estadoCarga.classList.remove("hidden");
    mensajeError.classList.add("hidden");
    btnVerMas.disabled = true; // Desactiva el botón mientras carga
    
    try {
        // Solicita la siguiente página de juegos
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=${juegosPorPagina}&pageNumber=${paginaActual}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error en la Respuesta de la API");
        }
        const data = await res.json();
        
        // Verifica si la página está vacía (fin de resultados)
        if (data.length === 0) {
            mensajeError.textContent = "No hay más juegos disponibles";
            mensajeError.classList.remove('hidden');
            btnVerMas.disabled = false;
            return;
        }
        
        // Renderiza los nuevos juegos (se agregan al grid existente)
        renderizarVideojuegos(data);
        paginaActual++; // Incrementa el contador de página
        btnVerMas.disabled = false; // Reactiva el botón
    }
    catch (e) {
        console.error("Error al cargar más juegos", e);
        mensajeError.classList.remove('hidden');
        btnVerMas.disabled = false;
    }
    finally {
        estadoCarga.classList.add('hidden');
    }
}

//Filtros de búsqueda//

// Botón "Ver más" - Carga mas juegos
if (btnVerMas) {
    btnVerMas.addEventListener('click', cargarMasJuegos);
}

// Botón "Buscar" - Da inicio a la búsqueda
if (btnBuscar) {
    btnBuscar.addEventListener('click', ejecutarBusqueda);
}

// Input de búsqueda - Busca al presionar Enter
if (inputBusqueda) {
    inputBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });
}

// filtro de plataforma - Aplica filtros al cambiar
if (selectPlataforma) {
    selectPlataforma.addEventListener('change', ejecutarBusqueda);
}

// filtro de orden - Aplica el orden seleccionado
if (selectOrdenar) {
    selectOrdenar.addEventListener('change', ejecutarBusqueda);
}

// Botón cerrar ventana de detalles (X) - Cierra la ventana de detalles
if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
}

// Cierra la ventana de detalles al hacer clic fuera de ella 
if (modalDetalles) {
    modalDetalles.addEventListener('click', (e) => {
        if (e.target === modalDetalles) {
            cerrarModal();
        }
    });
}

// Carga los videojuegos iniciales 
cargarVideojuegosInicial();
