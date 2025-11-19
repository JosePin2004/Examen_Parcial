// Sistema de Registro de Estudiantes - Examen Primer Parcial

// Array para almacenar estudiantes
let students = [];

// Cargar estudiantes desde localStorage al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadStudentsFromStorage();
    renderStudents();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    const form = document.getElementById('studentForm');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');

    form.addEventListener('submit', handleFormSubmit);
    clearBtn.addEventListener('click', clearForm);
    searchInput.addEventListener('input', handleSearch);
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const career = document.getElementById('studentCareer').value;
    const semester = document.getElementById('studentSemester').value;

    // Validar formulario
    if (!validateForm(name, id, email, career, semester)) {
        return;
    }

    // Crear objeto estudiante
    const student = {
        id: id,
        name: name,
        email: email,
        career: career,
        semester: semester,
        registrationDate: new Date().toLocaleDateString('es-ES')
    };

    // Agregar estudiante al array
    students.push(student);

    // Guardar en localStorage
    saveStudentsToStorage();

    // Renderizar lista de estudiantes
    renderStudents();

    // Limpiar formulario
    clearForm();

    // Mostrar mensaje de éxito
    showSuccessMessage('¡Estudiante registrado exitosamente!');
}

// Validar formulario
function validateForm(name, id, email, career, semester) {
    let isValid = true;

    // Limpiar mensajes de error
    clearErrors();

    // Validar nombre
    if (name.length < 3) {
        showError('nameError', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    }

    // Validar código de estudiante (debe ser único)
    if (id.length < 4) {
        showError('idError', 'El código debe tener al menos 4 caracteres');
        isValid = false;
    } else if (students.some(student => student.id === id)) {
        showError('idError', 'Este código ya está registrado');
        isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('emailError', 'Ingrese un correo electrónico válido');
        isValid = false;
    }

    // Validar carrera
    if (!career) {
        showError('careerError', 'Debe seleccionar una carrera');
        isValid = false;
    }

    // Validar semestre
    if (semester < 1 || semester > 10) {
        showError('semesterError', 'El semestre debe estar entre 1 y 10');
        isValid = false;
    }

    return isValid;
}

// Mostrar mensaje de error
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

// Limpiar mensajes de error
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Limpiar formulario
function clearForm() {
    document.getElementById('studentForm').reset();
    clearErrors();
}

// Renderizar lista de estudiantes
function renderStudents(studentsToRender = students) {
    const studentList = document.getElementById('studentList');
    const totalStudents = document.getElementById('totalStudents');

    // Actualizar contador
    totalStudents.textContent = students.length;

    // Si no hay estudiantes
    if (studentsToRender.length === 0) {
        studentList.innerHTML = '<p class="no-data">No hay estudiantes registrados.</p>';
        return;
    }

    // Crear HTML para cada estudiante
    const studentsHTML = studentsToRender.map(student => `
        <div class="student-card" data-id="${student.id}">
            <h3>${student.name}</h3>
            <div class="student-info">
                <p><strong>Código:</strong> ${student.id}</p>
                <p><strong>Semestre:</strong> ${student.semester}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Carrera:</strong> ${getCareerName(student.career)}</p>
                <p><strong>Fecha de registro:</strong> ${student.registrationDate}</p>
            </div>
            <div class="student-actions">
                <button class="btn-delete" onclick="deleteStudent('${student.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');

    studentList.innerHTML = studentsHTML;
}

// Obtener nombre completo de la carrera
function getCareerName(careerValue) {
    const careers = {
        'ingenieria-sistemas': 'Ingeniería de Sistemas',
        'ingenieria-software': 'Ingeniería de Software',
        'ciencias-computacion': 'Ciencias de la Computación',
        'desarrollo-web': 'Desarrollo Web'
    };
    return careers[careerValue] || careerValue;
}

// Eliminar estudiante
function deleteStudent(studentId) {
    if (confirm('¿Está seguro de eliminar este estudiante?')) {
        students = students.filter(student => student.id !== studentId);
        saveStudentsToStorage();
        renderStudents();
        showSuccessMessage('Estudiante eliminado exitosamente');
    }
}

// Buscar estudiantes
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        renderStudents();
        return;
    }

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.id.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );

    renderStudents(filteredStudents);
}

// Guardar estudiantes en localStorage
function saveStudentsToStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Cargar estudiantes desde localStorage
function loadStudentsFromStorage() {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    messageDiv.textContent = message;

    // Agregar al body
    document.body.appendChild(messageDiv);

    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Agregar estilos de animación para mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
