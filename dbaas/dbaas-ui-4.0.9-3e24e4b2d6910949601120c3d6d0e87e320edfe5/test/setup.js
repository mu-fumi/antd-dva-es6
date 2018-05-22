import { jsdom } from 'jsdom';

global.document = jsdom('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
global.window = global.document.defaultView;
global.navigator = global.window.navigator;

class storageMock {
    constructor() {
        this.storage = {};
    }

    setItem(key, value) {
        this.storage[key] = value || '';
    }
    getItem(key) {
        return key in this.storage ? this.storage[key] : null;
    }
    removeItem(key) {
        delete this.storage[key];
    }
    clear() {
        Object.keys(this.storage).map((v)=>{
            delete this.storage[v]
        });
    }
    get length()  {
        return Object.keys(this.storage).length;
    }
    key(i) {
        var keys = Object.keys(this.storage);
        return keys[i] || null;
    }
}

class cookieMock{
    constructor() {
        this.storage = '';
    }
    get cookie() {
        return this.storage;
    }
    set cookie(value) {
        this.storage += value + ';';
    }
}

window.DEBUG_LEVEL = 'debug'
// mock the localStorage
window.localStorage = new storageMock();
// mock the sessionStorage
window.sessionStorage = new storageMock();
window.cookie = new cookieMock();