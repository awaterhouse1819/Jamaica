import { HOTELS } from "./data.js";
import { initHeroTransition } from "./hero.js";
import { renderHotelGrid } from "./grid.js";
import { createModalController } from "./modal.js";

const heroScreen = document.getElementById("hero-screen");
const heroBackground = heroScreen?.querySelector(".hero-background");
const exploreButton = document.getElementById("explore-button");

const gridScreen = document.getElementById("grid-screen");
const destinationHeading = gridScreen?.querySelector(".destination-header h2");
const hotelGrid = document.getElementById("hotel-grid");

const modalRoot = document.getElementById("modal-root");
const modalController = createModalController(modalRoot);

if (heroBackground) {
  heroBackground.addEventListener("error", () => {
    heroBackground.src = "assets/hero-bg.svg";
  });
}

renderHotelGrid({
  container: hotelGrid,
  hotels: HOTELS,
  onCardSelect: (hotel, cardEl) => {
    cardEl.classList.add("is-opening");
    window.setTimeout(() => {
      cardEl.classList.remove("is-opening");
      modalController.open(hotel);
    }, 95);
  },
});

initHeroTransition({
  heroScreen,
  exploreButton,
  onExplore: () => {
    if (!destinationHeading) {
      return;
    }

    destinationHeading.setAttribute("tabindex", "-1");
    destinationHeading.focus({ preventScroll: true });
  },
});
