// Local storage keys
var LS = {
  CITY: "birge_city_v1",
  PROFILE: "birge_profile_v1",
  AI: "birge_ai_v1",
  AI_RATINGS: "birge_ai_ratings_v1",
  SLOTS: "birge_slots_v1",
  PAYMENTS: "birge_payments_v1"
};

// Helper: safe JSON load/save
function loadJSON(key) {
  try {
    var s = localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore
  }
}

// Show one screen by id, hide others
function showScreen(idName) {
  var screens = document.querySelectorAll(".app-screen");
  for (var i = 0; i < screens.length; i++) {
    var s = screens[i];
    s.classList.remove("active");
    s.classList.add("hidden");
  }
  var el = document.getElementById(idName);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("active");
  }
  // nav highlight
  var navs = document.querySelectorAll(".bottom-nav .nav-item");
  for (var j = 0; j < navs.length; j++) {
    var n = navs[j];
    n.classList.remove("active");
    var target = n.getAttribute("data-screen");
    if (target === idName) {
      n.classList.add("active");
    }
  }
}


/* ===== City buttons ===== */
var cityBtns = document.querySelectorAll(".city-btn");
for (var ci = 0; ci < cityBtns.length; ci++) {
  (function (btn) {
    btn.addEventListener("click", function () {
      var cityVal = btn.getAttribute("data-city") || btn.innerText || "Астана";
      localStorage.setItem(LS.CITY, cityVal);
      var mainCityEl = document.getElementById("mainCity");
      if (mainCityEl) mainCityEl.textContent = cityVal;
      launchFireworks();
      setTimeout(function () {
        var cityEl = document.getElementById("city");
        if (cityEl) {
          cityEl.classList.remove("active");
          cityEl.classList.add("hidden");
        }
        showScreen("main");
      }, 1400);
    });
  })(cityBtns[ci]);
}

/* ===== Settings card logic ===== */
var settingsBtn = document.getElementById("settingsBtn");
var settingsCard = document.getElementById("settingsCard");
var settingsClose = document.getElementById("settingsClose");
if (settingsBtn && settingsCard) {
  settingsBtn.addEventListener("click", function (e) {
    if (settingsCard.classList.contains("show")) {
      settingsCard.classList.remove("show");
      settingsCard.classList.remove("active");
    } else {
      settingsCard.classList.add("show");
      settingsCard.classList.add("active");
    }
  });
}
if (settingsClose && settingsCard) {
  settingsClose.addEventListener("click", function () {
    settingsCard.classList.remove("show");
    settingsCard.classList.remove("active");
  });
}
// click outside to close
document.addEventListener("click", function (e) {
  var target = e.target;
  if (!target) return;
  var insideSettings = settingsCard && settingsCard.contains(target);
  var isSettingsBtn = settingsBtn && (settingsBtn === target || settingsBtn.contains(target));
  if (!insideSettings && !isSettingsBtn) {
    if (settingsCard) {
      settingsCard.classList.remove("show");
      settingsCard.classList.remove("active");
    }
  }
});

/* ===== Lang menu logic ===== */

var langBtn = document.getElementById("langBtn");
var langMenu = document.getElementById("langMenu");
var langClose = document.getElementById("langClose");

if (langBtn && langMenu && langClose) {
  // открыть / закрыть меню по кнопке
  langBtn.addEventListener("click", function () {
    langMenu.classList.toggle("hidden");
    langMenu.classList.toggle("active");
  });

  // закрыть по крестику
  langClose.addEventListener("click", function () {
    langMenu.classList.add("hidden");
    langMenu.classList.remove("active");
  });
}

if (langMenu) {
  var langItems = langMenu.querySelectorAll("[data-lang]");
  for (var li = 0; li < langItems.length; li++) {
    (function (el) {
      el.addEventListener("click", function () {
        var code = el.getAttribute("data-lang") || el.innerText || "ru";
        if (langBtn) langBtn.textContent = code.toUpperCase() + " ▾";
        langMenu.classList.add("hidden");
      });
    })(langItems[li]);
  }
}

/* ===== Banner -> Pass screen ===== */
var banner = document.getElementById("banner");
if (banner) {
  banner.addEventListener("click", function () {
    showScreen("pass");
  });
}

/* ===== Pass subscribe (simulate) ===== */
var subscribeBtn = document.getElementById("subscribeBtn");
if (subscribeBtn) {
  subscribeBtn.addEventListener("click", function () {
    var slots = { active: true, cinema: 2, theatre: 1, concert: 1 };
    saveJSON(LS.SLOTS, slots);
    var pays = loadJSON(LS.PAYMENTS) || [];
    pays.push({ id: "pay_" + Date.now(), text: "Birge Pass подписка", amount: 990, ts: Date.now() });
    saveJSON(LS.PAYMENTS, pays);
    alert("Birge Pass оформлен");
    showScreen("wallet");
    renderSlots();
    renderPayments();
  });
}

/* ===== Bottom navigation ===== */
var navItems = document.querySelectorAll(".bottom-nav .nav-item");
for (var ni = 0; ni < navItems.length; ni++) {
  (function (nav) {
    nav.addEventListener("click", function () {
      var screen = nav.getAttribute("data-screen");
      if (!screen) return;
      showScreen(screen);
      if (screen === "programs") {
        renderAIHistory();
      }
    });
  })(navItems[ni]);
}

/* ===== Categories and subcategories ===== */
var subMap = {
  culture: ["Театр", "Концерты", "Стендап-шоу", "Выставки"],
  cinema: ["Кинотеатры", "Предпоказы", "Марафоны фильмов"],
  active: ["Квесты", "Спортклубы", "Йога-студии", "Картинг", "Боулинг"],
  social: ["Фан-встречи", "Открытые встречи", "Сообщества по интересам"],
  taste: ["Рестораны", "Кофейни", "Rooftop-бары", "Гастротуры"],
  travel: ["Городские экскурсии", "Направления для отдыха", "Выезды на природу"]
};


var catButtons = document.querySelectorAll(".cat-pill");
var subcatsWrap = document.getElementById("subcats");

function renderSubcats(key) {
  if (!subcatsWrap) return;
  subcatsWrap.innerHTML = "";
  var arr = subMap[key] || [];
  for (var i = 0; i < arr.length; i++) {
    var name = arr[i];
    var card = document.createElement("div");
    // add both class names to match possible CSS versions
    card.className = "subcard subcat-item";
    card.textContent = name;
    (function (c) {
      c.addEventListener("click", function () {
        // visual feedback
        var old = c.style.boxShadow;
        c.style.boxShadow = "0 0 0 6px rgba(165,107,255,0.12)";
        setTimeout(function () {
          c.style.boxShadow = old;
        }, 380);
      });
    })(card);
    subcatsWrap.appendChild(card);
  }
}

// init categories
for (var pi = 0; pi < catButtons.length; pi++) {
  (function (p) {
    p.addEventListener("click", function () {
      for (var x = 0; x < catButtons.length; x++) {
        catButtons[x].classList.remove("active");
      }
      p.classList.add("active");
      renderSubcats(p.getAttribute("data-key"));
    });
  })(catButtons[pi]);
}
// default
renderSubcats("culture");

/* ===== Новый ИИ генератор сценариев (реалистичный) ===== */

var locations = {
  restaurants: [
    { name: "Line Brew", address: "ул. Кенесары, 20", city: "Астана" },
    { name: "Rumi", address: "пр. Туран, 5", city: "Астана" },
    { name: "Del Papa", address: "ул. Кабанбай батыра, 19", city: "Алматы" },
    { name: "Ocean Basket", address: "ул. Абылай хана, 45", city: "Алматы" }
  ],
  parks: [
    { name: "Парк Астана", city: "Астана" },
    { name: "Парк Первого Президента", city: "Алматы" },
    { name: "Ботанический сад", city: "Алматы" }
  ],
  cinemas: [
    { name: "Chaplin Mega Silk Way", address: "ТРЦ Mega Silk Way", city: "Астана" },
    { name: "Kinopark Esentai", address: "ТРЦ Esentai Mall", city: "Алматы" }
  ],
  events: [
    "концерт под открытым небом",
    "спектакль в театре Жастар",
    "стендап-шоу в клубе Astana Event Hall",
    "ночь кино с классикой 90-х"
  ],
  weather: [
    "тёплая и уютная атмосфера",
    "прохладный вечер — идеален для прогулки",
    "лёгкий ветерок, можно взять шарф",
    "ясная погода, настроение супер",
    "немного облачно, но без дождя"
  ]
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAIScenario(query) {
  var city = localStorage.getItem(LS.CITY) || "Астана";
  var lower = query.toLowerCase();
  var restaurant = randomFrom(locations.restaurants.filter(function (r) {
    return r.city === city;
  })) || randomFrom(locations.restaurants);

  var park = randomFrom(locations.parks.filter(function (p) {
    return p.city === city;
  })) || randomFrom(locations.parks);

  var cinema = randomFrom(locations.cinemas.filter(function (c) {
    return c.city === city;
  })) || randomFrom(locations.cinemas);

  var event = randomFrom(locations.events);
  var weather = randomFrom(locations.weather);

  var timeOptions = ["17:00", "18:00", "19:00", "20:00"];
  var time = randomFrom(timeOptions);

  var scenario = "";

  if (lower.indexOf("девуш") !== -1 || lower.indexOf("роман") !== -1) {
    scenario =
      "🌇 Вечер с девушкой:\n" +
      "Свободные места в ресторане *" + restaurant.name + "* (" + restaurant.address + ").\n" +
      "Идеальное время — *" + time + "*. Забронировать столик?\n" +
      "Рядом — " + park.name + ", можно прогуляться после ужина.\n" +
      "Сейчас " + weather + ". Если тепло одеться, вечер получится волшебным 💜";
  } else if (lower.indexOf("друз") !== -1) {
    scenario =
      "👥 Вечер с друзьями:\n" +
      "Начните в *" + restaurant.name + "* — там отличное меню и просторные столы.\n" +
      "После — " + event + ".\n" +
      "Можно закончить вечер прогулкой по " + park.name + ".\n" +
      "Сегодня " + weather + ", настроение будет супер!";
  } else if (lower.indexOf("кино") !== -1) {
    scenario =
      "🎬 Кино-вечер:\n" +
      "Рекомендуем " + cinema.name + " (" + cinema.address + ").\n" +
      "Начало сеанса в *" + time + "*.\n" +
      "После фильма — кофе в " + restaurant.name + " рядом.\n" +
      "Погода: " + weather + ".";
  } else {
    scenario =
      "✨ План на вечер:\n" +
      "Посетите " + event + ", начало в *" + time + "*.\n" +
      "Перед этим можно перекусить в *" + restaurant.name + "* (" + restaurant.address + ").\n" +
      "После — прогулка по " + park.name + ".\n" +
      "Погода: " + weather + ". Что думаете?";
  }

  return scenario;
}

// Привязка к кнопке генерации
if (aiGen) {
  aiGen.addEventListener("click", function () {
    var q = aiInput && aiInput.value ? aiInput.value.trim() : "";
    if (!q) {
      aiOutput.textContent = "Введите запрос, например: 'Вечер с девушкой, Алматы'";
      return;
    }
    var scenario = generateAIScenario(q);
    aiOutput.innerHTML = scenario.replace(/\n/g, "<br>");
  });
}
/* ===== Profile logic ===== */
var phoneInput = document.getElementById("phoneInput");
var phoneNext = document.getElementById("phoneNext");
var profileForm = document.getElementById("profileForm");
var profileNotAuth = document.getElementById("profileNotAuth");
var avatarEl = document.getElementById("avatar");
var firstNameEl = document.getElementById("firstName");
var lastNameEl = document.getElementById("lastName");
var middleNameEl = document.getElementById("middleName");
var saveProfileBtn = document.getElementById("saveProfile");

function updateAvatarUI() {
  var prof = loadJSON(LS.PROFILE) || {};
  var initials = "?";
  if (prof && prof.first) {
    initials = (prof.first.charAt(0) || "") + (prof.last ? prof.last.charAt(0) : "");
    initials = initials.toUpperCase();
  }
  if (avatarEl) avatarEl.textContent = initials;
}
updateAvatarUI();

if (phoneNext) {
  phoneNext.addEventListener("click", function () {
    var phone = (phoneInput && phoneInput.value) ? phoneInput.value.trim() : "";
    if (!phone) {
      alert("Введите телефон");
      return;
    }
    var prof = loadJSON(LS.PROFILE) || {};
    prof.phone = phone;
    saveJSON(LS.PROFILE, prof);
    if (profileNotAuth) profileNotAuth.style.display = "none";
    if (profileForm) profileForm.classList.remove("hidden");
    if (phoneInput) {
      var phoneDisplay = document.getElementById("phoneDisplay");
      if (phoneDisplay) phoneDisplay.textContent = phone;
    }
    var saved = loadJSON(LS.PROFILE) || {};
    if (firstNameEl) firstNameEl.value = saved.first || "";
    if (lastNameEl) lastNameEl.value = saved.last || "";
    if (middleNameEl) middleNameEl.value = saved.middle || "";
    updateAvatarUI();
  });
}
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", function () {
    var prof = loadJSON(LS.PROFILE) || {};
    prof.first = (firstNameEl && firstNameEl.value) ? firstNameEl.value.trim() : "";
    prof.last = (lastNameEl && lastNameEl.value) ? lastNameEl.value.trim() : "";
    prof.middle = (middleNameEl && middleNameEl.value) ? middleNameEl.value.trim() : "";
    saveJSON(LS.PROFILE, prof);
    updateAvatarUI();
    alert("Профиль сохранён");
  });
}

/* ===== Wallet logic ===== */
var buyPassBtn = document.getElementById("buyPassBtn");
var slotsInfoEl = document.getElementById("slotsInfo");
var paymentsListEl = document.getElementById("paymentsList");

function renderSlots() {
  var slots = loadJSON(LS.SLOTS);
  if (slots && slots.active) {
    if (slotsInfoEl) slotsInfoEl.textContent = "Слотов: Кино: " + (slots.cinema || 0) + " | Театр: " + (slots.theatre || 0) + " | Концерт: " + (slots.concert || 0);
  } else {
    if (slotsInfoEl) slotsInfoEl.textContent = "Слотов нет. Купите Birge Pass";
  }
}
function renderPayments() {
  var pays = loadJSON(LS.PAYMENTS) || [];
  if (!paymentsListEl) return;
  paymentsListEl.innerHTML = "";
  if (!pays.length) {
    var li = document.createElement("li");
    li.textContent = "— Пока нет записей —";
    paymentsListEl.appendChild(li);
  } else {
    for (var pIndex = pays.length - 1; pIndex >= 0; pIndex--) {
      var p = pays[pIndex];
      var li2 = document.createElement("li");
      li2.textContent = p.text + " — " + p.amount + " ₸";
      paymentsListEl.appendChild(li2);
    }
  }
}

if (buyPassBtn) {
  buyPassBtn.addEventListener("click", function () {
    var slotsObj = { active: true, cinema: 2, theatre: 1, concert: 1 };
    saveJSON(LS.SLOTS, slotsObj);
    var payments = loadJSON(LS.PAYMENTS) || [];
    payments.push({ id: "pay_" + Date.now(), text: "Покупка Birge Pass", amount: 990, ts: Date.now() });
    saveJSON(LS.PAYMENTS, payments);
    alert("Birge Pass куплен (симуляция)");
    renderSlots();
    renderPayments();
  });
}

// initial render
renderSlots();
renderPayments();

// If a city is already saved show it in topbar
var stored = localStorage.getItem(LS.CITY);
if (stored) {
  var mcity = document.getElementById("mainCity");
  if (mcity) mcity.textContent = stored;
}

// Close menus with Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (settingsCard) {
      settingsCard.classList.remove("show");
      settingsCard.classList.remove("active");
    }
    if (langMenu) {
      langMenu.classList.add("hidden");
      langMenu.classList.remove("active");
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  /* ===== Локации с фото для подкатегорий ===== */
  var locationCards = {
    "Кинотеатры": [
      { name: "Chaplin Mega Silk Way", img: "https://i.imgur.com/Z3jYF1m.jpeg" },
      { name: "Kinopark Khan Shatyr", img: "https://i.imgur.com/Zpr1oGx.jpeg" },
      { name: "Cinemax Keruen", img: "https://i.imgur.com/1vMEXaZ.jpeg" },
      { name: "Chaplin Asia Park", img: "https://i.imgur.com/uqI1mA2.jpeg" }
    ],
    "Театр": [
      { name: "Театр Жастар", img: "https://i.imgur.com/hY3UpOZ.jpeg" },
      { name: "Астана Балет", img: "https://i.imgur.com/NZrmuvx.jpeg" },
      { name: "Астана Опера", img: "https://i.imgur.com/Q5f8uxy.jpeg" },
      { name: "Nomad City Hall", img: "https://i.imgur.com/y17FjIq.jpeg" }
    ],
    "Квесты": [
      { name: "Quest Zone", img: "https://i.imgur.com/LaR4Zy1.jpeg" },
      { name: "IQ Quest", img: "https://i.imgur.com/YBBOklL.jpeg" },
      { name: "Escape Room Astana", img: "https://i.imgur.com/dfEm99m.jpeg" },
      { name: "Enigma", img: "https://i.imgur.com/JtfLg8z.jpeg" }
    ],
    "Рестораны": [
      { name: "Line Brew", img: "https://i.imgur.com/lHjSxwX.jpeg" },
      { name: "Rumi", img: "https://i.imgur.com/j6Md8Cm.jpeg" },
      { name: "Del Papa", img: "https://i.imgur.com/tYLMjR7.jpeg" },
      { name: "Ocean Basket", img: "https://i.imgur.com/9yVweYI.jpeg" }
    ]
  };

  /* ===== Создание контейнера для карточек ===== */
  var container = document.createElement("div");
  container.id = "locationContainer";
  container.className = "location-container";
  document.body.appendChild(container);

  /* ===== Функция для отображения карточек ===== */
  function showLocationCards(subcategory) {
    container.innerHTML = "";
    var cards = locationCards[subcategory];

    if (!cards) {
      container.innerHTML = "<p style='text-align:center;margin-top:30px;'>Нет данных для этой категории</p>";
      return;
    }

    cards.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "location-card";
      card.innerHTML =
        "<img src='" + item.img + "' alt='" + item.name + "'>" +
        "<div class='loc-name'>" + item.name + "</div>";
      container.appendChild(card);
    });

    container.style.display = "grid";
    setTimeout(function () {
      container.classList.add("visible");
    }, 50);
  }

  /* ===== Привязка событий к кнопкам ===== */
  var subButtons = document.querySelectorAll(".subcategory");
  subButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.textContent.trim();
      showLocationCards(text);
    });
  });
});
