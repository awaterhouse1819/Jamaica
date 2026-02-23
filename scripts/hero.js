const HERO_TRANSITION_MS = 400;
const LATER_WIGGLE_MS = 280;

export function initHeroTransition({ heroScreen, exploreButton, laterButton, heroDialog, onExplore }) {
  let hasStarted = false;

  const startTransition = () => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
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

  const triggerLaterWiggle = () => {
    heroDialog.classList.remove("is-wiggling");
    void heroDialog.offsetWidth;
    heroDialog.classList.add("is-wiggling");

    window.setTimeout(() => {
      heroDialog.classList.remove("is-wiggling");
    }, LATER_WIGGLE_MS);
  };

  exploreButton.addEventListener("click", startTransition);
  laterButton.addEventListener("click", triggerLaterWiggle);

  return {
    startTransition,
  };
}
