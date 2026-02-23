const FALLBACK_PHOTO = "assets/hotels/fallback.svg";

function createHotelCard(hotel, onCardSelect) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "hotel-card";
  card.setAttribute("aria-label", `Open details for ${hotel.name}`);

  const image = document.createElement("img");
  image.className = "hotel-card-photo";
  image.src = hotel.photos?.[0] ?? FALLBACK_PHOTO;
  image.alt = `${hotel.name} preview`;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.src = FALLBACK_PHOTO;
  });

  const body = document.createElement("div");
  body.className = "hotel-card-body";

  const title = document.createElement("h3");
  title.className = "hotel-name";
  title.textContent = hotel.name;

  const location = document.createElement("p");
  location.className = "hotel-location";
  location.textContent = `◉ ${hotel.location}`;

  body.append(title, location);
  card.append(image, body);

  card.addEventListener("click", () => {
    onCardSelect(hotel, card);
  });

  return card;
}

export function renderHotelGrid({ container, hotels, onCardSelect }) {
  const fragment = document.createDocumentFragment();

  hotels.forEach((hotel) => {
    fragment.appendChild(createHotelCard(hotel, onCardSelect));
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}
