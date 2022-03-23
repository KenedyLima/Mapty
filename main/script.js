'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const localStorage = window.localStorage;
let workoutId = 0;
let map, mapEvent;

//Classes
//Workout
class Workout {
  constructor(distance, duration, type, value, date, coords) {
    this.distance = distance;
    this.duration = duration;
    this.type = type;
    this.value = value;
    this.date = date;
    this.coords = coords;
  }
  getDescription() {
    return `${this.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
      this.type.charAt(0).toUpperCase() + this.type.slice(1)
    } on ${months[this.date.getMonth()]} ${this.date.getDate()}
  `;
  }

  calcAverageSpeed() {
    let speed = this.distance / this.duration;
    return speed.toFixed(2);
  }
}

//Workout Container
class WorkoutContainer {
  constructor() {
    this.workouts = [];
  }

  getWorkouts() {
    return this.workouts;
  }

  setWorkouts(workouts) {
    this.workouts = workouts;
  }

  insertNewWorkout(workout) {
    this.workouts.push(workout);
  }
}

const container = new WorkoutContainer();

//Callback Functions
const showForm = function (mapE) {
  mapEvent = mapE;

  cleanFormFields();
  form.classList.remove('hidden');
  inputDistance.focus();
};

function submitNewWorkout(e) {
  e.preventDefault();
  addNewWorkout();
  console.log(container.getWorkouts().slice(-1));

  renderWorkoutsOnMap(container.getWorkouts().slice(-1));
  renderWorkoutsOnList(container.getWorkouts().slice(-1));
  saveWorkoutList();
  cleanFormFields();
  map.setView(mapEvent.latlng);
  form.classList.add('hidden');
}

function switchInputType() {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
}

function goToWorkout(e) {
  if (!e.target.closest('.workout')) return;
  const id = Number(e.target.closest('.workout').getAttribute('workout_id'));
  const workout = container.getWorkouts()[id];
  map.setView(workout.coords, 13);
}

function pageLoad() {
  createObjects(JSON.parse(localStorage.getItem('workoutList')));
  loadMap();
  renderWorkoutsOnList(container.getWorkouts());
}

//Helper Functions

function createObjects(objects) {
  objects.forEach(function (workout) {
    container.workouts.push(
      new Workout(
        workout.distance,
        workout.duration,
        workout.type,
        workout.value,
        new Date(workout.date),
        workout.coords
      )
    );
  });
}

function cleanFormFields() {
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
}

function addNewWorkout() {
  const value =
    inputElevation.value === '' ? inputCadence.value : inputElevation.value;
  let workout = new Workout(
    inputDistance.value,
    inputDuration.value,
    inputType.value,
    value,
    new Date(),
    mapEvent.latlng
  );

  container.insertNewWorkout(workout);
}

function renderWorkoutsOnMap(workoutList) {
  workoutList.forEach(function (workout) {
    const coords = workout.coords;
    console.log(coords);

    L.marker(coords)
      .addTo(map)
      .bindPopup(
        L.popup({
          maxwidth: 250,
          maxheight: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        }).setContent(`${workout.getDescription()}`)
      )
      .openPopup();
  });
}
function renderWorkoutsOnList(workoutList) {
  if (!workoutList) return;
  workoutList.forEach(workout => {
    const date = new Date(workout.date);
    const element = document.createElement('li');
    let html = '';
    let icon = '';
    let className = '';

    if (workout.type === 'cycling') {
      icon = '🚴‍♀️';
      className = 'workout--cycling';
      html = `<div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.value}</span>
      <span class="workout__unit">m</span>
    </div>`;
    } else {
      icon = '🏃‍♂️';
      className = 'workout--running';
      html = `<div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.value}</span>
      <span class="workout__unit">spm</span>
    </div>`;
    }

    element.innerHTML = `<h2 class="workout__title">${workout.getDescription()}</h2>
    <div class="workout__details">
      <span class="workout__icon">${icon}</span>
      <span class="workout__value">${workout.value}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.value}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.calcAverageSpeed()}</span>
      <span class="workout__unit">min/km</span>
    </div>
    ${html}
  `;

    element.setAttribute('workout_id', workoutId++);
    element.classList.add('workout', className);
    containerWorkouts.append(element);
  });
}

function saveWorkoutList() {
  localStorage.setItem('workoutList', JSON.stringify(container.getWorkouts()));
}
function loadMap() {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const coords = [position.coords.latitude, position.coords.longitude];

      map = L.map('map').setView(coords, 13);
      renderWorkoutsOnMap(container.getWorkouts());

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', showForm);
    },
    function () {
      alert('Could not load the map');
    }
  );
}

//Event Listeners

window.addEventListener('load', pageLoad);
form.addEventListener('submit', submitNewWorkout);
inputType.addEventListener('change', switchInputType);
containerWorkouts.addEventListener('click', goToWorkout);
