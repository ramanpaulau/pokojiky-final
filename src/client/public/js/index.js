const loading = document.querySelector(".loading");
const burger = document.querySelector(".burger");
const menu = document.querySelector(".menu-nav");
const logo = document.querySelector(".logo");
const line1 = document.querySelector(".line1");
const line2 = document.querySelector(".line2");

barba.init({
  transitions: [
    {
      leave() {
        if (menu.classList.contains("opened")) {
          navToggle();
        }
        let done = this.async();
        //Animation leave
        const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        timeline.fromTo(
          ".swipe",
          0.75,
          { x: "-100%" },
          { x: "0%", onComplete: done }
        );
      },
      enter() {
        let done = this.async();
        window.scroll(0, 0);
        //Animation enter
        const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        timeline.fromTo(
          ".swipe",
          0.3,
          { x: "0%" },
          { x: "100%", stagger: 0.3, onComplete: done },
          "-=0.6"
        );
      },
    },
  ],
});

window.addEventListener("load", (event) => {
  setTimeout(function () {
    loading.classList.add("loading-off");
  }, 1000);
});

