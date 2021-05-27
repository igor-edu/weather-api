const API_TOKEN_MAPBOX =
  'pk.eyJ1IjoiaWdvcmNvbCIsImEiOiJjazlzY3E0Y3kxMnlwM2hwbmpvc25raHBoIn0.C07xU-VzZpdFzHJCro2Qng';
const APP_ID_OPENWEATHERMAP = '00b8ed89379d910ed384cd51a8826016';

const searchDiv = document.querySelector('.search'),
  searchForm = document.getElementById('search-form'),
  searchInput = document.getElementById('search-input'),
  searchIcon = document.getElementById('search-icon'),
  closeSearchDivIcon = document.getElementById('close-search-div-icon'),
  searchResultsList = document.getElementById('search-results-list'),
  savedLocationsList = document.getElementById('saved-locations-list'),
  recentSearchesList = document.getElementById('recent-searches-list'),
  addToMyLocationsButton = document.getElementById('add-to-my-locations'),
  savedInMyLocationsButton = document.getElementById('saved-in-my-locations');

// ------------------------------------------------------------------------------------------------ MODEL DATA
updateCurrentLocation();

function getSavedLocations() {
  if (!localStorage.getItem('saved-locations')) return [];
  return JSON.parse(localStorage.getItem('saved-locations'));
}

function setSavedLocations(newLocation) {
  if (!localStorage.getItem('saved-locations')) {
    localStorage.setItem('saved-locations', JSON.stringify([newLocation]));
    return;
  }

  let locations = JSON.parse(localStorage.getItem('saved-locations'));
  locations = locations.filter((item) => item.name !== newLocation.name);
  if (locations.unshift(newLocation) > 5) locations.pop();
  localStorage.setItem('saved-locations', JSON.stringify(locations));
}

function getRecentSearches() {
  if (!localStorage.getItem('recent-searches')) return [];
  return JSON.parse(localStorage.getItem('recent-searches'));
}

function setRecentSearches(newSearch) {
  if (!localStorage.getItem('recent-searches')) {
    localStorage.setItem('recent-searches', JSON.stringify([newSearch]));
    return;
  }

  let recentSearches = JSON.parse(localStorage.getItem('recent-searches'));
  recentSearches = recentSearches.filter((item) => item !== newSearch);
  if (recentSearches.unshift(newSearch) > 5) recentSearches.pop();
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches));
}

function getCurrentLocation() {
  if (!localStorage.getItem('current-location')) return null;
  return JSON.parse(localStorage.getItem('current-location'));
}

function setCurrentLocation(newLocation) {
  localStorage.setItem('current-location', JSON.stringify(newLocation));
}

function checkCurrentLocationSaved() {
  const savedLocations = getSavedLocations();
  const currentLocation = getCurrentLocation();
  return savedLocations.some(
    (location) => location.name === currentLocation.name
  );
}

function resetLocalStorage() {
  localStorage.setItem('saved-locations', '');
  localStorage.setItem('recent-searches', '');
  localStorage.setItem('current-location', '');
}

function updateCurrentLocation() {
  const newLocation = {};
  newLocation.target = {};
  newLocation.target.tagName = 'LI';

  if (!getCurrentLocation()) {
    newLocation.target.pointer = JSON.parse(
      `{"name":"Frankfurt am Main, Hessen, Germany","latitude":50.11361,"longitude":8.67972}`
    );
  } else {
    newLocation.target.pointer = getCurrentLocation();
  }

  handleSearchResultsList(newLocation);
}
// ------------------------------------------------------------------------------------------------ END OF MODEL DATA

// ------------------------------------------------------------------------------------------------ VIEW
updatePage();

function updatePage() {
  updateSavedLocationsList();
  updateRecentSearchesList();
  updateWeatherDiv();
  updateObservationsDiv();
}

function updateSearchResultsList(foundLocations) {
  const searchResoltsList = document.getElementById('search-results-list');
  const p = document.getElementById('no-search-results');
  searchResoltsList.innerHTML = '';

  if (foundLocations.length === 0) {
    p.innerHTML = `Your search did not bring any results. Please try again. Here are some helpful suggestions. 
      The feature you are trying to look up could be an address, a point of interest name, a city name, etc. 
      When searching for points of interest, it can also be a category name (for example, “coffee shop”). 
      The search text must not contain the semicolon character.
      Your search text must consist of at most 20 words and numbers separated by spacing and punctuation, and at most 256 characters.`;
    return;
  }

  p.innerHTML = '';

  foundLocations.forEach((location) => {
    const li = document.createElement('li');
    li.textContent = location.name;
    li.pointer = location;
    searchResoltsList.append(li);
  });
}

function updateSavedLocationsList() {
  const savedLocations = getSavedLocations();
  const list = document.getElementById('saved-locations-list');
  list.innerHTML = '';

  if (savedLocations.length === 0) {
    list.innerHTML =
      '<p>No saved locations yet... Save your locations of interest.</p>';
    return;
  }

  savedLocations.forEach((location) => {
    const li = document.createElement('li');
    li.innerHTML = location.name;
    li.pointer = location;
    list.append(li);
  });
}

function updateRecentSearchesList() {
  const recentSearches = getRecentSearches();
  const list = document.getElementById('recent-searches-list');
  list.innerHTML = '';

  if (recentSearches.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = 'No recent searches yet... Search for location above!';
    list.append(li);
    return;
  }

  recentSearches.forEach((search) => {
    const li = document.createElement('li');
    li.innerHTML = search;
    list.append(li);
  });
}

function updateWeatherDiv() {
  const currentLocation = getCurrentLocation();
  if (!currentLocation || !currentLocation.data || !currentLocation.data.list)
    return;

  const hourlyForecasts = currentLocation.data.list;
  const carouselMoving = document.querySelector('.carousel__moving');
  carouselMoving.innerHTML = '';

  hourlyForecasts.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('carousel__item');

    div.innerHTML = `
      <div class="carousel__item--basic">
        <div class="carousel__item--time">${dayOfWeek(
          new Date(item.dt_txt)
        )}</div>
        <div class="carousel__item--time">${item.dt_txt.slice(11, 16)}</div>
        <div class="carousel__item--cloud-icon"><img src="https://openweathermap.org/img/wn/${
          item.weather[0].icon
        }@2x.png" alt="cloud icon"></div>
        <div class="carousel__item--temperature">${item.main.temp}&#176;C</div>
        <div class="carousel__item--wind">
          <img src="https://img.icons8.com/dotty/80/000000/south-direction.png"/>
          <span class="carousel__item--wind-speed">${item.wind.speed}</span>
        </div>
      </div>
      <div class="carousel__item--added">
        <h4 class="carousel__item--added--heading">${
          item.weather[0].description
        }</h4>
        <p class="carousel__item--added--humidity">Humidity: <span>${
          item.main.humidity
        }</span>%</p>
        <p class="carousel__item--added--pressure">Pressure: <span>${
          item.main.pressure
        }</span>mb</p>
        <p class="carousel__item--added--cloudiness">Cloudiness: <span>${
          item.clouds.all
        }</span>%</p>
        <p class="carousel__item--added--temperature">Temperature min: <span>${
          item.main.temp_min
        }</span>&#176;C</p>
        <p class="carousel__item--added--temperature">Temperature max: <span>${
          item.main.temp_max
        }</span>&#176;C</p>
        <p class="carousel__item--added--temperature">Feels like: <span>${
          item.main.feels_like
        }</span>&#176;C</p>
        <p class="carousel__item--added--wind">Wind speed: <span>${
          item.wind.speed
        }</span>m/sec</p>
        <p class="carousel__item--added--wind">From: ${windFromDirection(
          item.wind.deg
        )}</p>
      </div>`;

    div.querySelector(
      '.carousel__item--wind img'
    ).style.transform = `rotate(${item.wind.deg}deg)`;
    carouselMoving.append(div);
  });

  document.querySelector('.carousel__frame').scrollLeft = 0;

  document.querySelectorAll('.carousel__item').forEach((item) => {
    item.addEventListener('click', handleCarouselItem);
  });

  document.getElementById('location-displayed').innerHTML =
    currentLocation.name;

  if (checkCurrentLocationSaved()) {
    addToMyLocationsButton.classList.remove('shown');
    savedInMyLocationsButton.classList.add('shown');
  } else {
    addToMyLocationsButton.classList.add('shown');
    savedInMyLocationsButton.classList.remove('shown');
  }

  const now = new Date();
  document.querySelector('p#last-updated span').innerHTML = `${padNumber(
    now.getHours()
  )}:${padNumber(now.getMinutes())}`;
}

function updateObservationsDiv() {
  const currentLocation = getCurrentLocation();
  if (!currentLocation || !currentLocation.data || !currentLocation.data.list)
    return;
  const data = currentLocation.data;

  const observations = document.querySelector('.observations');
  const now = new Date();

  const time = observations.querySelector('p.observations__left--time span');
  time.innerHTML = `${padNumber(now.getHours())}:${padNumber(
    now.getMinutes()
  )}`;

  const date = observations.querySelector('.observations__left--date');
  date.innerHTML = `${dayOfWeekLonger(now)} ${monthOfYear(now)}`;

  const temperature = observations.querySelector(
    '.observations__right--temperature span'
  );
  temperature.innerHTML = `${data.list[0].main.temp}&#176;C`;

  const pressure = observations.querySelector(
    '.observations__right--pressure span'
  );
  pressure.innerHTML = `${data.list[0].main.pressure}mb`;

  const humidity = observations.querySelector(
    '.observations__right--humidity span'
  );
  humidity.innerHTML = `${data.list[0].main.humidity}%`;

  const windSpeed = observations.querySelector(
    '.observations__right--wind-speed span'
  );
  windSpeed.innerHTML = `${data.list[0].wind.speed}m/sec`;

  const windDirection = observations.querySelector(
    '.observations__right--wind-direction span'
  );
  windDirection.innerHTML = `${windFromDirection(data.list[0].wind.deg)}`;

  const station = observations.querySelector(
    '.observations__right--station span'
  );
  station.innerHTML = `${data.city.name}, ${data.city.country}`;

  const latitude = observations.querySelector('#observations-latitude');
  latitude.innerHTML = `${data.city.coord.lat}`;

  const longitude = observations.querySelector('#observations-longitude');
  longitude.innerHTML = `${data.city.coord.lon}`;
}
// ------------------------------------------------------------------------------------------------ END OF VIEW

// ------------------------------------------------------------------------------------------------ CONTROLER
searchDiv.addEventListener('click', handleSearchDiv);
searchForm.addEventListener('submit', handleSearchForm);
searchForm.addEventListener('click', handleSearchFormClick);
addToMyLocationsButton.addEventListener('click', handleAddToMyLocationsButton);

function handleSearchFormClick(e) {
  if (e.target === searchInput) return openSearchDiv();

  if (e.target === searchIcon) {
    openSearchDiv();
    return handleSearchForm(e);
  }

  if (e.target === searchForm) return;
}

function handleSearchForm(e) {
  e.preventDefault();
  if (searchInput.value === '') return;
  setRecentSearches(searchInput.value);
  updateRecentSearchesList();
  const search = formatSearchText(searchInput.value);
  const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=${API_TOKEN_MAPBOX}`;

  fetch(searchUrl)
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.features || data.features.length === 0)
        return updateSearchResultsList([]);
      updateSearchResultsList(extractFeatures(data.features));
    })
    .catch(() => updateSearchResultsList([]));
}

function handleCloseSearchDivIcon(e) {
  closeSearchDiv();
}

function handleRecentSearchesList(e) {
  if (e.target.tagName !== 'LI') return;
  const li = e.target;
  searchInput.value = li.innerHTML;
  let event = new Event('submit');
  searchForm.dispatchEvent(event);
}

function handleSearchResultsList(e) {
  if (e.target.tagName !== 'LI') return;
  const li = e.target;
  const location = li.pointer;
  const searchUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${APP_ID_OPENWEATHERMAP}`;

  fetch(searchUrl)
    .then((res) => res.json())
    .then((data) => {
      const currentLocation = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        data: data,
      };

      setCurrentLocation(currentLocation);
      updateWeatherDiv();
      updateObservationsDiv();
      closeSearchDiv();
    })
    .catch(() => closeSearchDiv());
}

function handleSearchDiv(e) {
  if (e.target === closeSearchDivIcon) return closeSearchDiv();
  if (e.target.closest('ul') === searchResultsList)
    return handleSearchResultsList(e);
  if (e.target.closest('ul') === savedLocationsList)
    return handleSearchResultsList(e);
  if (e.target.closest('ul') === recentSearchesList)
    return handleRecentSearchesList(e);
}

function openSearchDiv() {
  searchDiv.classList.add('open');
}

function closeSearchDiv() {
  searchDiv.classList.remove('open');
}

function handleAddToMyLocationsButton(e) {
  let currentLocation = JSON.parse(JSON.stringify(getCurrentLocation()));
  currentLocation.data = '';
  setSavedLocations(currentLocation);
  updateSavedLocationsList();
  document.getElementById('add-to-my-locations').classList.remove('shown');
  document.getElementById('saved-in-my-locations').classList.add('shown');
}
// ------------------------------------------------------------------------------------------------ END OF CONTROLER

// ------------------------------------------------------------------------------------------------ HELPER FUNCTIONS
function formatSearchText(text) {
  const formatted = text.replace(/(;|%3B|%3b)/g, ' ');
  return encodeURIComponent(formatted);
}

function extractFeatures(locations) {
  return locations.map((location) => ({
    name: location.place_name,
    latitude: location.center[1],
    longitude: location.center[0],
  }));
}

function dayOfWeek(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

function dayOfWeekLonger(date) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

function monthOfYear(date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getDay()]}`;
}

function padNumber(number) {
  if (number < 10) return '0' + number;
  return '' + number;
}

function windFromDirection(direction) {
  if (0 <= direction && direction <= 5) return 'north';
  if (5 <= direction && direction <= 40) return 'north north-east';
  if (40 <= direction && direction <= 50) return 'north-east';
  if (50 <= direction && direction <= 85) return 'east north-east';
  if (85 <= direction && direction <= 95) return 'east';
  if (95 <= direction && direction <= 130) return 'east south-east';
  if (130 <= direction && direction <= 140) return 'south-east';
  if (140 <= direction && direction <= 175) return 'south south-east';
  if (175 <= direction && direction <= 185) return 'south';
  if (185 <= direction && direction <= 220) return 'south south-west';
  if (220 <= direction && direction <= 230) return 'south-west';
  if (230 <= direction && direction <= 265) return 'west south-west';
  if (265 <= direction && direction <= 275) return 'west';
  if (275 <= direction && direction <= 310) return 'west north-west';
  if (310 <= direction && direction <= 320) return 'north-west';
  if (320 <= direction && direction <= 355) return 'north north-west';
  if (355 <= direction && direction <= 360) return 'north';
}
// ------------------------------------------------------------------------------------------------ END OF HELPER FUNCTIONS

// ------------------------------------------------------------------------------------------------ CAROUSEL FUNCTIONS
const carousel = document.querySelector('.carousel'),
  carouselLeft = carousel.querySelector('.carousel__left'),
  carouselRight = carousel.querySelector('.carousel__right'),
  carouselCenter = carousel.querySelector('.carousel__center'),
  carouselFrame = carousel.querySelector('.carousel__frame'),
  carouselMoving = carousel.querySelector('.carousel__moving'),
  carouselButtonRight = carousel.querySelector('.carousel__button--right'),
  carouseButtonlLeft = carousel.querySelector('.carousel__button--left'),
  carouselPaddingLeft = carousel.querySelector('.carousel__padding--left'),
  carouselPaddingRight = carousel.querySelector('.carousel__padding--right'),
  carouselItems = carousel.querySelectorAll('.carousel__item'),
  carouselItem = carousel.querySelector('.carousel__item'),
  carouselItemWidth = carouselItem ? carouselItem.offsetWidth : 0,
  carouselTransitionTime = 600;

adjustCarousel();
carouselButtonRight.addEventListener('click', (e) => moveCarousel(e, 1));
carouseButtonlLeft.addEventListener('click', (e) => moveCarousel(e, -1));

function adjustCarousel() {
  const carouselItem = carousel.querySelector('.carousel__item'),
    carouselItems = carousel.querySelectorAll('.carousel__item'),
    maxWidth = carouselCenter.offsetWidth - 2,
    itemWidth = carouselItem ? carouselItem.offsetWidth : 0,
    newWidth = findMaxMultiple(maxWidth, itemWidth),
    difference = maxWidth - newWidth;

  let paddingLeft, paddingRight;
  if (difference % 2 === 0) {
    paddingLeft = difference / 2;
    paddingRight = difference / 2;
  } else {
    paddingLeft = Math.floor(difference / 2);
    paddingRight = paddingLeft + 1;
  }

  carouselPaddingLeft.style.flexBasis = paddingLeft + 'px';
  carouselPaddingRight.style.flexBasis = paddingRight + 'px';
  carouselMoving.style.width = carouselItems.length * itemWidth + 'px';
  carouselFrame.style.flexBasis = maxWidth - paddingLeft - paddingRight + 'px';
}

function findMaxMultiple(number, divisor) {
  let i = 0;
  if (divisor <= 0) return number;
  while (i * divisor <= number) i++;
  return divisor * (i - 1);
}

function moveCarousel(e, sign) {
  const oldPosition = carouselFrame.scrollLeft;
  let newPosition = carouselFrame.scrollLeft + 2 * sign * carouselItemWidth;
  newPosition = findMaxMultiple(newPosition, carouselItemWidth);
  const distance = newPosition - oldPosition;
  smoothScroll(carouselFrame, distance, carouselTransitionTime);
}

function smoothScroll(element, numPixels, time) {
  numPixels = Math.round(numPixels);
  if (numPixels === 0) return;
  const sign = numPixels > 0 ? 1 : -1;
  const interval = Math.round(time / (sign * numPixels));
  const move = () => (element.scrollLeft += sign);

  for (let i = 1; i <= sign * numPixels; i++) {
    setTimeout(move, i * interval);
  }
}

function scrollCarouselItemIntoView(carouselItem) {
  const carouselItemCoords = carouselItem.getBoundingClientRect();
  const carouselFrameCoords = carouselFrame.getBoundingClientRect();

  if (carouselItemCoords.left < carouselFrameCoords.left) {
    const distance = carouselItemCoords.left - carouselFrameCoords.left;
    smoothScroll(carouselFrame, distance, carouselTransitionTime);
  }

  if (
    carouselItemCoords.left + 4 * carouselItemWidth >
    carouselFrameCoords.right
  ) {
    const distance =
      carouselItemCoords.left +
      4 * carouselItemWidth -
      carouselFrameCoords.right;
    smoothScroll(carouselFrame, distance, carouselTransitionTime);
  }
}

function handleCarouselItem(e) {
  const carousel = this.closest('.carousel'),
    carouselItems = carousel.querySelectorAll('.carousel__item'),
    itemCoords = this.getBoundingClientRect(),
    carouselFrameCoords = carouselFrame.getBoundingClientRect();

  if (
    itemCoords.left < carouselFrameCoords.left &&
    this.classList.contains('open')
  ) {
    this.classList.remove('open');
    smoothScroll(
      carouselFrame,
      itemCoords.left + carouselItemWidth - carouselFrameCoords.left,
      carouselTransitionTime
    );
    return;
  }

  if (
    Array.from(carouselItems).every(
      (item) =>
        !item.classList.contains('open') &&
        itemCoords.left + 4 * carouselItemWidth > carouselFrameCoords.right
    )
  ) {
    this.classList.add('open');
    scrollCarouselItemIntoView(this);
    return;
  }

  carouselItems.forEach((item) => {
    if (item === this) {
      item.classList.toggle('open');
    } else {
      item.classList.remove('open');
    }
  });

  setTimeout(() => scrollCarouselItemIntoView(this), carouselTransitionTime);
}
// ------------------------------------------------------------------------------------------------ END OF CAROUSEL FUNCTIONS
