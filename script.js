const btn = document.getElementById('hamburgerBtn')
const nav = document.getElementById('nav')

// Abre e fecha o menu ao clicar no hambúrguer
btn.addEventListener('click', function () {
  nav.classList.toggle('nav-aberto')
})

// Fecha o menu ao clicar em qualquer link
const links = document.querySelectorAll('.nav-link')

links.forEach(function (link) {
  link.addEventListener('click', function () {
    nav.classList.remove('nav-aberto')
  })
})