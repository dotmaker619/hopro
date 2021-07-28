function onScroll(el) {
  if (el) {
    let card_position = card.getBoundingClientRect();

    let position = el.parentElement.getBoundingClientRect();
    if (position.top < card_position.top || position.top > card_position.bottom - 60) {
      el.style.visibility = "hidden";
    } else {
      el.style.visibility = "visible";
      el.style.top = position.top + "px";
    }
  }
}

function windowScroll(el) {
  if (el && el.parentElement) {
    let position = el.parentElement.getBoundingClientRect();
    el.style.top = position.top + "px";
  }
}

function onClick(el, vnode) {
  let position = el.parentElement.getBoundingClientRect();
  el.style.position = "fixed";
  el.style.top = position.bottom + "px";
  el.style.left = position.left + "px";
  vnode.context.$emit("click");
}

export const Position = {
  inserted(el, binding, vnode) {
    let cards = document.getElementsByClassName("tickets-card--list");

    cards.forEach((card) => {
      card.addEventListener("scroll", onScroll(el));
    });

    window.addEventListener("scroll", windowScroll(el));

    el.parentElement.addEventListener("click", onClick(el, vnode));
  },
  unbind(el, binding) {
    console.log("unbind");

    console.log("removing window listener");
    card.removeEventListener("scroll", onScroll);
    el.parentElement.removeEventListener("click", windowScroll);
    window.removeEventListener("scroll", onClick);
  },
};
