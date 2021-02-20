/**
 * STEPS:
 * 1. create a requestController class and define the needed variables for the API call
 * 2. Create a method that will get the current (last added) comic and set the currentComicsNumber and
 *    maxComicsNumber accordingly, call that method on load
 * 3. Register an event for the random comic number and add all the chain of event to display it
 * 4. Add Previous/Next, First/Last and get Comic by ID functionality to the app
 * 5. Adjust UI states accordingly
 */

class DomInterface {
    constructor() {
        this.form = document.querySelector('#comic-form');
        this.searchField = document.querySelector('#search-input');

        this.title = document.querySelector('#comic-title');
        this.image = document.querySelector('#comic-image');

        this.error = document.querySelector('#error');
        this.formError = document.querySelector('#form-error');
        this.loader = document.querySelector('#loader');

        this.controls = {
            previous: document.querySelector('#request-prev'),
            next: document.querySelector('#request-next'),
            random: document.querySelector('#request-random'),
            first: document.querySelector('#request-first'),
            last: document.querySelector('#request-last'),
        };
    }

    clearResults() {
        this.title.innerHTML = 'Loading...';
        this.image.src = '';
        this.image.alt = '';
    }

    hideLoader() {
        this.loader.classList.remove('d-flex');
        this.loader.classList.add('d-none');
    }

    showLoader() {
        this.loader.classList.remove('d-none');
        this.loader.classList.add('d-flex');
    }

    showError() {
        this.hideLoader();
        this.error.innerHTML = 'There has been an error, please try again';
    }

    showFormError(message) {
        this.hideLoader();
        this.formError.innerHTML = message;
    }

    hideErrors() {
        this.error.innerHTML = '';
        this.formError.innerHTML = '';
    }

    showComics(data) {
        const { title, img } = data;

        this.title.innerHTML = title;
        this.image.src = img;
        if (data.alt) this.image.alt = data.alt;

        this.hideLoader();
    }
}

class RequestController {
    constructor() {
        this.DomInterface = new DomInterface();
        this.corsHeader = 'https://the-ultimate-api-challenge.herokuapp.com';
        this.apiUrl = 'https://xkcd.com';
        this.apiUrlFormat = 'info.0.json';
        this.superAgent = superagent;

        this.currentComicsNumber = 0;
        this.maxComicsNumber = 0;

        this.getCurrentComics();
        this.registerEvents();
    }

    setMaxComicsNumber(number) {
        this.maxComicsNumber = number;
    }

    setCurrentComicsNumber(number) {
        this.currentComicsNumber = number;
    }

    getRandomComicsNumber() {
        const min = 1;
        const max = this.maxComicsNumber;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    }

    getCurrentComics() {
        const requestUrl = `${this.corsHeader}/${this.apiUrl}/${this.apiUrlFormat}`;

        this.superAgent.get(requestUrl).end((error, response) => {
            if (error) {
                this.DomInterface.showError();
            }
            const data = response.body;

            this.DomInterface.showComics(data);
            this.setCurrentComicsNumber(data.num);
            this.setMaxComicsNumber(data.num);
        });
    }

    getComicsByNumber(number) {
        this.DomInterface.hideErrors();
        this.DomInterface.showLoader();
        this.DomInterface.clearResults();

        const requestUrl = `${this.corsHeader}/${this.apiUrl}/${number}/${this.apiUrlFormat}`;

        this.superAgent.get(requestUrl).end((error, response) => {
            if (error) {
                this.DomInterface.showError();
            }

            const data = response.body;

            this.setCurrentComicsNumber(data.num);
            this.DomInterface.showComics(data);
        });
    }

    requestPreviousComics() {
        const requestedComicsNumber = this.currentComicsNumber - 1;
        console.log({ requestedComicsNumber });
        if (requestedComicsNumber < 1) return;

        this.getComicsByNumber(requestedComicsNumber);
    }

    requestNextComics() {
        const requestedComicsNumber = this.currentComicsNumber + 1;
        if (requestedComicsNumber > this.maxComicsNumber) return;

        this.getComicsByNumber(requestedComicsNumber);
    }

    requestComicsById(e) {
        e.preventDefault();

        const query = this.DomInterface.searchField.value;
        if (!query || query === '') return;
        if (query < 1 || query > this.maxComicsNumber) {
            return this.DomInterface.showFormError(`Try a number between 1 and ${this.maxComicsNumber}`);
        }

        this.getComicsByNumber(query);
    }

    registerEvents() {
        this.DomInterface.controls.random.addEventListener('click', () =>
            this.getComicsByNumber(this.getRandomComicsNumber())
        );

        this.DomInterface.controls.first.addEventListener('click', () => this.getComicsByNumber(1));
        this.DomInterface.controls.last.addEventListener('click', () => this.getComicsByNumber(this.maxComicsNumber));

        this.DomInterface.controls.previous.addEventListener('click', () => this.requestPreviousComics());
        this.DomInterface.controls.next.addEventListener('click', () => this.requestNextComics());

        this.DomInterface.form.addEventListener('submit', e => this.requestComicsById(e));
    }
}

const comics = new RequestController();
