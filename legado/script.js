let show = true;
const menuContent = document.querySelector('.content');
const menuToggle = document.querySelector('.menu-toggle');
const searchButton = document.querySelector('.search-btn');
const citySearchInput = document.getElementById('city-search');
const header = document.getElementById('header');
const headerClassList = header.classList;

// Toggle menu de navegação
menuToggle.addEventListener('click', () => {
    document.body.style.overflow = show ? 'hidden' : 'initial';
    menuContent.classList.toggle('on', show);
    show = !show;
});

// Pesquisa de cidade
searchButton.addEventListener('click', () => {
    const city = citySearchInput.value.trim().toLowerCase();
    const cityUrls = {
        "jaraguá do sul": "https://www.jaraguadosul.sc.gov.br",
        "são paulo": "https://www.prefeitura.sp.gov.br",
        "rio de janeiro": "https://www.rio.rj.gov.br",
        "curitiba": "https://www.curitiba.pr.gov.br",
        "florianópolis": "https://www.pmf.sc.gov.br"
    };

    if (cityUrls[city]) {
        window.location.href = cityUrls[city];
    } else if (city) {
        alert("Desculpe, não encontramos o site da prefeitura dessa cidade.");
    } else {
        alert("Por favor, insira o nome de uma cidade para pesquisar.");
    }
});

// Rolagem suave ao clicar nos links do menu
document.querySelectorAll('.list-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animação dos ícones sociais ao passar o mouse
const socialIcons = document.querySelectorAll('.list-menu i');
socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
    });
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
    });
});

// Animação nos cartões de evento ao passar o mouse
const eventCards = document.querySelectorAll('.itens-cardapio div');
eventCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'transform 0.3s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY >= 150) {
        if (!headerClassList.contains('scrollHide')) {
        headerClassList.add('scrollHide')
        }
    } else {
        if (headerClassList.contains('scrollHide')) {
        headerClassList.remove('scrollHide')
    }
    }
})

/*======================================scroll reveal =============*/
ScrollReveal({
    distance: '80px',
    duration: 2000,
    delay: 250,
});

ScrollReveal().reveal('.conteudo-principal', { origin: 'top' });
ScrollReveal().reveal('.title_cardapio, .itens-cardapio, .title_contact', { origin: 'bottom' });
ScrollReveal().reveal('.contentsobre, .flashcard', { origin: 'left' });
ScrollReveal().reveal('', { origin: 'left' });
ScrollReveal().reveal('.img-cozinha, .contatos-secao', { origin: 'right' });
