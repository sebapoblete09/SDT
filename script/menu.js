// Obtener los botones y secciones del menú
const menuButtons = document.querySelectorAll('.menu-btn');
const menuSections = document.querySelectorAll('.menu-section');

// Función para manejar el cambio de sección
menuButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Remover la clase 'active' de todos los botones
    menuButtons.forEach(btn => btn.classList.remove('active'));

    // Agregar la clase 'active' al botón seleccionado
    this.classList.add('active');

    // Ocultar todas las secciones del menú
    menuSections.forEach(section => section.classList.remove('active'));

    // Mostrar la sección correspondiente al botón presionado
    const sectionId = this.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
});
