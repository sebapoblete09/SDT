document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const carouselContainer = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.carousel-item');
    let index = 0;

    function updateCarousel() {
        const offset = -index * 100; /* Mueve el contenedor hacia la izquierda */
        carouselContainer.style.transform = `translateX(${offset}%)`;
    }

    prevButton.addEventListener('click', () => {
        index = (index > 0) ? index - 1 : items.length - 1;
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        index = (index < items.length - 1) ? index + 1 : 0;
        updateCarousel();
    });

    // Opcional: Automatizar el carrusel
    setInterval(() => {
        nextButton.click();
    }, 5000); // Cambia la imagen cada 5 segundos
});