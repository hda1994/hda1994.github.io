"use strict";

const MONTH = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
const DAY = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const CLOUDS = ['без осадков','снег','дождь','снег с дождем'];
const TODAY = 'Сегодня';
const CLOUD = ['Ясно','Облачно'];

// timeStamp начала сегодняшнего дня
const getToday = () => {
	const now = new Date();
	const dateTmp = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return dateTmp.getTime();
};
// день недели 
const getDayOfWeek = elem => {
	if(getToday() == elem.date) {
		return TODAY;
	}
	const date = new Date(elem.date);
	return DAY[date.getDay()];
};
// число и месяц
const getDate = elem => {
	const date = new Date(elem.date);
	return `${date.getDate()} ${MONTH[date.getMonth()]}`;
};
// класс для картинки погоды
const getCloudinessImgClass = elem => {
	switch(elem.cloudiness) {
		case CLOUD[0]:
			if(elem.snow) {
				return 'weather-list-item__img--sun-snow';
			}
			if(elem.rain) {
				return 'weather-list-item__img--sun-rain';
			}
			return 'weather-list-item__img--sun-none';
		case CLOUD[1]:
			if(elem.snow) {
				return 'weather-list-item__img--cloud-snow';
			}
			if(elem.rain) {
				return 'weather-list-item__img--cloud-rain';
			}
			return 'weather-list-item__img--cloud-none';
	}
	return 'weather-list-item__img--cloud-none';
};
// преобразование температуры
const convetrTemp = temp => temp > 0 ? `+${temp}` : `${temp}`;
// осадки короткое представление getCloudinessText1
const getCloudinessText = elem => CLOUDS[2 * elem.rain + elem.snow];

const getCloudinessText1 = elem => {
	if(elem.snow) {
		if(elem.rain) {
			return CLOUDS[0];
		}
		else {
			return CLOUDS[1];
		}
	}
	else {
		if(elem.rain) {
			return CLOUDS[2];
		}
		else {
			return CLOUDS[3];
		}
	}
};

const createDOMElement = (tag, text, ...className) => {
	const element = document.createElement(tag);
	className.forEach(elem => element.classList.add(elem));
	element.append(document.createTextNode(text));
	return element;
};
// шаблон даты в header
const createToday = () => {
	const date = new Date(getToday());
	return createDOMElement('span', `Самара, ${date.getDate()} ${MONTH[date.getMonth()]}, ${DAY[new Date(getToday()).getDay()]}`, 'header__h1-today');
};
// шаблон карточки погоды
const createItem = elem => {
	const mainDiv = createDOMElement('div', '', 'weather-list__item', 'weather-list-item');
	mainDiv.append(createDOMElement('div', getDayOfWeek(elem), 'weather-list-item__day-name'));
	mainDiv.append(createDOMElement('div', getDate(elem), 'weather-list-item__date'));
	mainDiv.append(createDOMElement('div', '', 'weather-list-item__img', getCloudinessImgClass(elem)));
	mainDiv.append(createDOMElement('div', `Днем ${convetrTemp(elem.temperature.day)}`, 'weather-list-item__day-temp'));
	mainDiv.append(createDOMElement('div', `Ночью ${convetrTemp(elem.temperature.night)}`, 'weather-list-item__night-temp'));
	mainDiv.append(createDOMElement('div', `${elem.cloudiness},`, 'weather-list-item__cloudiness'));
	mainDiv.append(createDOMElement('div', getCloudinessText(elem), 'weather-list-item__precipitation'));
	return mainDiv;
};
// шаблон прелоудера
const createPreload = () => {
	const mainDiv = createDOMElement('div', '', 'weather-list__item', 'weather-list-item');
	const spinner = createDOMElement('div', '', 'spinner');
	Array(5).fill().forEach((elem, index) => {
		spinner.append(createDOMElement('div', '', `rect${index + 1}`));
	});
	mainDiv.append(spinner);
	return mainDiv;
};
// смещение timeStamp на days дней
const getDateTimeStamp = (timeStamp, days) => {
	const tmp = new Date(timeStamp);
	tmp.setDate(tmp.getDate() + days);
	return tmp.getTime();
};
// генератор JSON 
const help = () => {
	const now = new Date();
	now.setDate(now.getDate() - 3);
	const dateTmp = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return JSON.stringify(new Array(20).fill().map(() => {
		const elem = {
			"temperature": {}
		};
		elem.date = dateTmp.getTime();
		elem.cloudiness = Math.random() > 0.5? 'Облачно' : 'Ясно';
		elem.snow = Math.random() > 0.5;
		elem.rain = Math.random() > 0.5;
		elem.temperature.day = Math.round(50 * Math.random() - 20);
		elem.temperature.night = Math.round(50 * Math.random() - 20);
		dateTmp.setDate(dateTmp.getDate() + Math.round(1.7 * Math.random()));
		// dateTmp.setDate(dateTmp.getDate() + 1);
		return elem;
	}))
};

const mydata = JSON.parse(weather);
const data = mydata.filter(elem => elem.date >= getToday());

document.addEventListener('DOMContentLoaded', event => {
	let prevActive = false;
	let nextActive = false;
	let tmpShowDate = getToday();

	const showWeather = (timeStamp, data) => {	
		const container = document.querySelector('.js-weather__list');
		container.innerHTML = '';
		let tmpItem;

		Array(4).fill().forEach(() => {
			tmpItem = data.find(elem => elem.date == timeStamp);
			if(tmpItem) {
				container.append(createItem(tmpItem));
			}
			else {
				container.append(createPreload());
			}
			timeStamp = getDateTimeStamp(timeStamp, 1);
		});

		if(Array(4).fill(1).find((el, index) => {
				tmpItem = data.find(elem => elem.date == getDateTimeStamp(timeStamp, index));
				return tmpItem;
			})) {
			nextActive = true;
			document.querySelector('.weather__nav--next').classList.add('active');
		}
		else {
			nextActive = false;
			document.querySelector('.weather__nav--next').classList.remove('active');
		}

		if(Array(4).fill(1).find((el, index) => {
				if(getDateTimeStamp(timeStamp, -5 - index) >= getToday()) {
					return true;
				}
				tmpItem = data.find(elem => elem.date == getDateTimeStamp(timeStamp, -5 - index));
				return tmpItem;
			})) {
			prevActive = true;
			document.querySelector('.weather__nav--prev').classList.add('active');
		}
		else {
			prevActive = false;
			document.querySelector('.weather__nav--prev').classList.remove('active');
		}
	};

	document.querySelector('.header__h1').append(createToday());
	showWeather(tmpShowDate, data);

	document.querySelector('.weather__nav--prev').addEventListener('click', event => {
		if(prevActive) {
			tmpShowDate = getDateTimeStamp(tmpShowDate, -1);
			showWeather(tmpShowDate, data);
		}
	});
	document.querySelector('.weather__nav--next').addEventListener('click', event => {
		if(nextActive) {
			tmpShowDate = getDateTimeStamp(tmpShowDate, 1);
			showWeather(tmpShowDate, data);
		}
	});
});





