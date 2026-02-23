const HERO_TRANSITION_MS = 400;

export function initHeroTransition({ heroScreen, exploreButton, onExplore }) {
  let hasStarted = false;

  const startTransition = () => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    exploreButton.classList.add("is-clicked");
    heroScreen.classList.add("is-exiting");
    document.body.classList.remove("state-hero");
    document.body.classList.add("state-grid");

    window.setTimeout(() => {
      heroScreen.setAttribute("aria-hidden", "true");
      if (typeof onExplore === "function") {
        onExplore();
      }
    }, HERO_TRANSITION_MS);
  };

  exploreButton.addEventListener("click", startTransition);

  return {
    startTransition,
  };
}
