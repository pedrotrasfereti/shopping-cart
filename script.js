/* Elementos */
const cartList = document.querySelector('.cart__items');
const loading = document.querySelector('.loading');
const totalText = document.querySelector('.total-price');
const refreshBtn = document.querySelector('#shopping-cart');

/* Botões */
const emptyCartBtn = document.querySelector('.empty-cart');
const scrollTopBtn1 = document.querySelector('.scroll-top-btn');
const scrollTopBtn2 = document.querySelector('.scroll-top');

// Quinto Requisito
function sum(accumulator, currentValue) {
  return accumulator + currentValue;
}

function calcTotal() {
  const prices = [];
  Object.values(cartList.children)
  .forEach((child) => prices.push(parseFloat(child.innerText.split('$').pop(), 2)));
  const total = parseFloat(prices.reduce(sum, 0).toFixed(2));
  totalText.innerText = total;
}

const config = { attributes: false, childList: true, subtree: true };
const observer = new MutationObserver(calcTotal);
observer.observe(cartList, config);

// Quarto Requisito -- salvar carrinho
function saveCart() {
  const cartData = cartList.innerHTML;
  localStorage.setItem('lastSave', cartData);
}

// Sexto Requisito -- limpar carrinho
function emptyCart() {
  cartList.innerHTML = '';
  saveCart();
}
emptyCartBtn.addEventListener('click', emptyCart);

// Terceiro Requisito -- remover item do carrinho
function cartItemClickListener(event) {
  cartList.removeChild(event.target);
  saveCart();
}

// Quarto Requisito -- carregar carrinho
function loadCart() {
  const lastSave = localStorage.getItem('lastSave');
  if (lastSave) {
    cartList.innerHTML = lastSave;
    const cartItems = document.querySelectorAll('.cart__item');
    cartItems.forEach((item) => {
      item.addEventListener('click', cartItemClickListener);
    });
  }
}

// Segundo Requisito -- adicionar item ao carrinho
function createCartItemElement(sku, name, salePrice) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  cartList.appendChild(li);
  saveCart();
}

function fetchProduct(itemID) {
  fetch(`https://api.mercadolibre.com/items/${itemID}`)
    .then((response) => {
      response.json().then((data) => {
        createCartItemElement(data.id, data.title, data.price);
      });
    });
}

function getSkuFromProductItem(item) {
  const sku = item.target.previousElementSibling.previousElementSibling
    .previousElementSibling.innerText;
  fetchProduct(sku);
}

function productItemClickListener() {
  const products = document.querySelectorAll('.item');
  products.forEach((product) => product.querySelector('button.item__add')
    .addEventListener('click', getSkuFromProductItem));
}

// Primeiro Requisito -- carregar produtos através do API
function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

const addItemsToSection = (items) => {
  items.forEach((item) => {
    const itemElement = createProductItemElement(item);
    const section = document.querySelector('.items');
    section.appendChild(itemElement);
  });
};

// Sétimo Requisito -- loading screen
const fetchML = (query) => {
  fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
    .then((response) => {
      response.json().then((data) => {
        addItemsToSection(data.results);
        loading.remove();
        productItemClickListener();
      });
    });
};

// Funções adicionais
const searchInput = document.querySelector('#search_input');

const search = (event) => {
  if (event.keyCode === 13) {
    const items = document.querySelectorAll('.item');
    const itemContainer = document.querySelector('.items');
    items.forEach((item) => itemContainer.removeChild(item));
    fetchML(searchInput.value);
    searchInput.value = '';
  }
  return 0;
};
searchInput.addEventListener('keyup', search);

function scrollButton() {
  if (document.documentElement.scrollTop > 80 && document.documentElement.scrollTop < 3910) {
    scrollTopBtn1.style.display = "block";
  } else {
    scrollTopBtn1.style.display = "none";
  }
}

function scrolltoTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
scrollTopBtn1.addEventListener('click', scrolltoTop);
scrollTopBtn2.addEventListener('click', scrolltoTop);

function refresh() {
  location.reload(); 
}
refreshBtn.addEventListener('click', refresh);

// Eventos da janela
window.onscroll = () => scrollButton();

window.onload = () => {
  fetchML('computador');
  loadCart();
  scrollButton();
};
