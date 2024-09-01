let slideIndex = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;
    const offset = -slideIndex * 100;
    document.querySelector('.carousel-wrapper').style.transform = `translateX(${offset}%)`;
}

function moveSlide(step) {
    slideIndex += step;
    showSlide(slideIndex);
}

setInterval(() => moveSlide(1), 5000); // Cambia cada 5 segundos

document.addEventListener('DOMContentLoaded', () => showSlide(slideIndex));
