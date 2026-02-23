const FALLBACK_PHOTO = "assets/hotels/fallback.svg";
const MODAL_OUT_MS = 150;

function clampRating(value) {
  return Math.max(0, Math.min(5, Number(value) || 0));
}

function buildStat({ label, value, isActivity = false }) {
  const stat = document.createElement("div");
  stat.className = "stat";

  const statLabel = document.createElement("span");
  statLabel.className = "stat-label";
  statLabel.textContent = label;

  const statBar = document.createElement("div");
  statBar.className = "stat-bar";

  const normalized = clampRating(value);
  for (let index = 0; index < 5; index += 1) {
    const block = document.createElement("div");
    block.classList.add("stat-block");

    if (index < normalized) {
      block.classList.add("filled");
      if (isActivity) {
        block.classList.add("activity");
      }
    } else {
      block.classList.add("empty");
    }

    statBar.appendChild(block);
  }

  stat.append(statLabel, statBar);
  return stat;
}

function buildAmenityItem(label) {
  const amenity = document.createElement("p");
  amenity.className = "amenity-item";

  const bullet = document.createElement("span");
  bullet.className = "amenity-bullet";
  bullet.textContent = "■";

  const text = document.createElement("span");
  text.textContent = label;

  amenity.append(bullet, text);
  return amenity;
}

function buildPhotoLayers({ photos, hotelName }) {
  const stage = document.createElement("div");
  stage.className = "modal-photo-stage";

  const layers = [document.createElement("img"), document.createElement("img")];
  layers.forEach((layer, index) => {
    layer.className = "modal-photo-layer";
    layer.alt = `${hotelName} photo ${index + 1}`;
    layer.decoding = "async";
    layer.loading = "eager";
    layer.addEventListener("error", () => {
      layer.src = FALLBACK_PHOTO;
    });
    stage.appendChild(layer);
  });

  layers[0].src = photos[0];
  layers[0].classList.add("is-visible");

  return { stage, layers };
}

export function createModalController(modalRoot) {
  let activeModal = null;
  let previousBodyOverflow = "";

  const destroyActiveModal = () => {
    if (!activeModal) {
      return;
    }

    document.removeEventListener("keydown", activeModal.escapeHandler);
    activeModal.backdrop.remove();
    document.body.style.overflow = previousBodyOverflow;
    activeModal = null;
  };

  const close = () => {
    if (!activeModal || activeModal.isClosing) {
      return;
    }

    activeModal.isClosing = true;
    activeModal.backdrop.classList.remove("is-open");
    activeModal.backdrop.classList.add("is-closing");

    window.setTimeout(() => {
      destroyActiveModal();
    }, MODAL_OUT_MS);
  };

  const open = (hotel) => {
    if (activeModal) {
      destroyActiveModal();
    }

    const photos = Array.isArray(hotel.photos) && hotel.photos.length > 0 ? hotel.photos : [FALLBACK_PHOTO];

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("article");
    modal.className = "hotel-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", `${hotel.name} details`);

    const titlebar = document.createElement("header");
    titlebar.className = "modal-titlebar";

    const title = document.createElement("h3");
    title.className = "modal-title";
    title.textContent = hotel.name;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "modal-close";
    closeButton.setAttribute("aria-label", "Close details");
    closeButton.textContent = "✕";

    titlebar.append(title, closeButton);

    const { stage, layers } = buildPhotoLayers({ photos, hotelName: hotel.name });

    const countPill = document.createElement("div");
    countPill.className = "modal-photo-count";
    countPill.textContent = `1 / ${photos.length}`;
    stage.appendChild(countPill);

    let currentIndex = 0;
    let activeLayerIndex = 0;

    const renderPhoto = (nextIndex) => {
      const total = photos.length;
      const wrapped = (nextIndex + total) % total;
      const incomingLayerIndex = activeLayerIndex === 0 ? 1 : 0;
      const incomingLayer = layers[incomingLayerIndex];
      const outgoingLayer = layers[activeLayerIndex];

      incomingLayer.src = photos[wrapped] ?? FALLBACK_PHOTO;
      incomingLayer.alt = `${hotel.name} photo ${wrapped + 1}`;
      incomingLayer.classList.add("is-visible");
      outgoingLayer.classList.remove("is-visible");

      activeLayerIndex = incomingLayerIndex;
      currentIndex = wrapped;
      countPill.textContent = `${wrapped + 1} / ${photos.length}`;
    };

    if (photos.length > 1) {
      const prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.className = "modal-photo-nav prev";
      prevButton.setAttribute("aria-label", "Previous photo");
      prevButton.textContent = "←";
      prevButton.addEventListener("click", () => {
        renderPhoto(currentIndex - 1);
      });

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "modal-photo-nav next";
      nextButton.setAttribute("aria-label", "Next photo");
      nextButton.textContent = "→";
      nextButton.addEventListener("click", () => {
        renderPhoto(currentIndex + 1);
      });

      stage.append(prevButton, nextButton);
    }

    const linkRow = document.createElement("div");
    linkRow.className = "modal-location-row";

    const mapLink = document.createElement("a");
    mapLink.className = "modal-link location";
    mapLink.href = hotel.googleMapsUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noreferrer noopener";
    mapLink.textContent = `◉ ${hotel.location}`;

    const siteLink = document.createElement("a");
    siteLink.className = "modal-link website";
    siteLink.href = hotel.website;
    siteLink.target = "_blank";
    siteLink.rel = "noreferrer noopener";
    siteLink.textContent = "WEBSITE ↗";

    linkRow.append(mapLink, siteLink);

    const description = document.createElement("p");
    description.className = "modal-description";
    description.textContent = hotel.description;

    const priceNote = document.createElement("p");
    priceNote.className = "modal-price-note";
    priceNote.textContent = `EST. MARCH RATE: ~$${hotel.marchPrice}/NT`;

    const amenities = document.createElement("section");
    amenities.className = "modal-amenities";
    amenities.setAttribute("aria-label", "Amenities");
    hotel.amenities.forEach((item) => {
      amenities.appendChild(buildAmenityItem(item));
    });

    const statsWrap = document.createElement("section");
    statsWrap.className = "modal-stats";
    statsWrap.setAttribute("aria-label", "Ratings");

    const statGrid = document.createElement("div");
    statGrid.className = "stat-grid";

    statGrid.append(
      buildStat({ label: "PRICE", value: hotel.priceTier }),
      buildStat({ label: "SECLUSION", value: hotel.seclusion }),
      buildStat({ label: "ACTIVITY", value: hotel.activity, isActivity: true }),
      buildStat({ label: "ROMANCE", value: hotel.romance }),
    );

    statsWrap.appendChild(statGrid);

    modal.append(titlebar, stage, linkRow, description, priceNote, amenities, statsWrap);
    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        close();
      }
    });

    closeButton.addEventListener("click", close);

    const escapeHandler = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalRoot.appendChild(backdrop);
    document.addEventListener("keydown", escapeHandler);

    activeModal = {
      backdrop,
      escapeHandler,
      isClosing: false,
    };

    window.requestAnimationFrame(() => {
      backdrop.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
    });
  };

  return {
    open,
    close,
  };
}
