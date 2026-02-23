const FALLBACK_PHOTO = "assets/hotels/fallback.svg";
const MODAL_OUT_MS = 150;

function clampRating(value) {
  return Math.max(0, Math.min(5, Number(value) || 0));
}

function buildStat({ label, value, isActivity = false }) {
  const stat = document.createElement("div");
  stat.className = "stat";
  stat.classList.add(`stat-${label.toLowerCase()}`);

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

function normalizePhotos(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return [FALLBACK_PHOTO];
  }

  const normalized = photos.map(
    (photo) => (typeof photo === "string" && photo.length > 0 ? photo : FALLBACK_PHOTO),
  );
  const unique = [];
  normalized.forEach((photo) => {
    if (!unique.includes(photo)) {
      unique.push(photo);
    }
  });

  return unique.slice(0, 12);
}

function buildPhotoImage(photo, hotelName) {
  const image = document.createElement("img");
  image.className = "modal-photo-layer";
  image.alt = `${hotelName} photo`;
  image.decoding = "async";
  image.loading = "eager";
  image.src = photo ?? FALLBACK_PHOTO;
  image.addEventListener("error", () => {
    image.src = FALLBACK_PHOTO;
  });
  return image;
}

function buildPhotoNav(direction, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `modal-photo-nav modal-photo-${direction}`;
  button.setAttribute("aria-label", ariaLabel);
  button.textContent = direction === "prev" ? "<" : ">";
  return button;
}

function buildMapPinIcon() {
  const svgNS = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(svgNS, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");
  icon.classList.add("location-icon");

  const pinPath = document.createElementNS(svgNS, "path");
  pinPath.setAttribute("d", "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z");

  const centerCircle = document.createElementNS(svgNS, "circle");
  centerCircle.setAttribute("cx", "12");
  centerCircle.setAttribute("cy", "10");
  centerCircle.setAttribute("r", "3");

  icon.append(pinPath, centerCircle);
  return icon;
}

function buildPhotoStage({ photos, hotelName }) {
  const stage = document.createElement("div");
  stage.className = "modal-photo-stage";

  const hasMultiplePhotos = photos.length > 1;
  const visibleImage = buildPhotoImage(photos[0], hotelName);
  const hiddenImage = buildPhotoImage(photos[0], hotelName);
  const countPill = document.createElement("div");
  countPill.className = "modal-photo-count";
  countPill.textContent = `1 / ${photos.length}`;

  let activeIndex = 0;
  let isShowingPrimary = true;

  visibleImage.classList.add("is-visible");

  const showPhoto = (nextIndex) => {
    if (!hasMultiplePhotos) {
      return;
    }

    const normalizedIndex = ((nextIndex % photos.length) + photos.length) % photos.length;
    if (normalizedIndex === activeIndex) {
      return;
    }

    const incoming = isShowingPrimary ? hiddenImage : visibleImage;
    const outgoing = isShowingPrimary ? visibleImage : hiddenImage;

    incoming.src = photos[normalizedIndex] ?? FALLBACK_PHOTO;
    incoming.alt = `${hotelName} photo ${normalizedIndex + 1}`;

    incoming.classList.add("is-visible");
    outgoing.classList.remove("is-visible");
    isShowingPrimary = !isShowingPrimary;
    activeIndex = normalizedIndex;
    countPill.textContent = `${activeIndex + 1} / ${photos.length}`;
  };

  if (hasMultiplePhotos) {
    const prevButton = buildPhotoNav("prev", "Previous photo");
    const nextButton = buildPhotoNav("next", "Next photo");

    prevButton.addEventListener("click", () => {
      showPhoto(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      showPhoto(activeIndex + 1);
    });

    stage.append(prevButton, nextButton);
  }

  stage.append(visibleImage, hiddenImage, countPill);

  return {
    stage,
    setIndex: (nextIndex) => {
      showPhoto(nextIndex);
    },
    getActiveIndex: () => activeIndex,
    hasMultiplePhotos,
    getCountPill: () => countPill,
  };
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
    const normalizedPhotos = normalizePhotos(photos);
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
    const titleLink = document.createElement("a");
    titleLink.className = "modal-title-link";
    titleLink.href = hotel.website;
    titleLink.target = "_blank";
    titleLink.rel = "noreferrer noopener";
    titleLink.textContent = hotel.name;
    title.appendChild(titleLink);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "modal-close";
    closeButton.setAttribute("aria-label", "Close details");
    closeButton.textContent = "✕";

    titlebar.append(title, closeButton);

    const photoStage = buildPhotoStage({
      photos: normalizedPhotos,
      hotelName: hotel.name,
    });

    const linkRow = document.createElement("div");
    linkRow.className = "modal-location-row";

    const mapLink = document.createElement("a");
    mapLink.className = "modal-link location";
    mapLink.href = hotel.googleMapsUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noreferrer noopener";
    const mapPin = buildMapPinIcon();

    const mapText = document.createElement("span");
    mapText.className = "location-text";
    mapText.textContent = hotel.location;

    mapLink.append(mapPin, mapText);

    const instagramLink = typeof hotel.instagram === "string" ? hotel.instagram.trim() : "";
    const preferredInstagramLink = instagramLink || hotel.website;

    const siteLink = document.createElement("a");
    siteLink.className = "modal-link website";
    siteLink.href = preferredInstagramLink;
    siteLink.target = "_blank";
    siteLink.rel = "noreferrer noopener";
    siteLink.textContent = "INSTAGRAM";

    linkRow.append(mapLink, siteLink);

    const descriptionText = document.createElement("p");
    descriptionText.className = "modal-description";
    descriptionText.textContent = hotel.description;

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

    modal.append(titlebar, photoStage.stage, linkRow, descriptionText, amenities, statsWrap);
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

      if (!photoStage?.hasMultiplePhotos) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const nextIndex = photoStage.getActiveIndex() - 1;
        photoStage.setIndex(nextIndex);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = photoStage.getActiveIndex() + 1;
        photoStage.setIndex(nextIndex);
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
