import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
    url: 'http://localhost',
    pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.history = dom.window.history;
global.location = dom.window.location;
global.MouseEvent = dom.window.MouseEvent;
global.Node = dom.window.Node;
global.XMLHttpRequest = dom.window.XMLHttpRequest;
global.MutationObserver = dom.window.MutationObserver;
global.Blob = dom.window.Blob;
global.FormData = dom.window.FormData;
