document.addEventListener("DOMContentLoaded", () => {

  // DATE
  const dateEl = document.getElementById("topDate");
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  // LIVE BLINK 0.5 SEC
  const liveBtn = document.getElementById("liveBtn");
  let on = true;

  setInterval(() => {
    on = !on;
    if (on) liveBtn.classList.remove("blink-black");
    else liveBtn.classList.add("blink-black");
  }, 500);

  liveBtn.addEventListener("click", () => {
    window.open("https://www.youtube.com/", "_blank");
  });

});
