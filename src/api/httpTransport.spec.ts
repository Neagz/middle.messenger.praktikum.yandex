import { expect } from 'chai';
import sinon from 'sinon';
import HTTPTransport from './httpTransport.ts';

describe('HTTPTransport', () => {
    let http: HTTPTransport;
    let sandbox: sinon.SinonSandbox;
    let fakeXHR: sinon.SinonFakeXMLHttpRequestStatic;
    let requests: sinon.SinonFakeXMLHttpRequest[] = [];

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Создаем фейковый XHR
        fakeXHR = sandbox.useFakeXMLHttpRequest();
        requests = [];
        fakeXHR.onCreate = (xhr) => {
            requests.push(xhr);
        };

        http = new HTTPTransport();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Должен сделать GET запрос', (done) => {
        http.get('/test')
            .then(() => {
                expect(requests.length).to.equal(1);
                expect(requests[0].method).to.equal('GET');
                expect(requests[0].url).to.include('/test');
                done();
            })
            .catch(done);

        requests[0].respond(200, {}, '{}');
    });

    it('Должен сделать POST запрос с данными', (done) => {
        const testData = { key: 'value' };

        http.post('/test', testData)
            .then(() => {
                expect(requests[0].method).to.equal('POST');
                expect(requests[0].requestBody).to.equal(JSON.stringify(testData));
                done();
            })
            .catch(done);

        requests[0].respond(200, {}, '{}');
    });

    it('Должен обрабатывать ошибки', (done) => {
        http.get('/test')
            .then(() => done(new Error('Ожидалась ошибка')))
            .catch((err) => {
                expect(err.message).to.equal('Request failed');
                done();
            });

        requests[0].respond(400, {}, '{"reason":"Request failed"}');
    });

    it('Должен отправлять FormData', (done) => {
        const formData = new FormData();
        formData.append('file', new Blob(['test']), 'test.txt');

        http.post('/upload', formData)
            .then(() => {
                void expect(requests[0].requestHeaders['Content-Type']).to.not.exist;
                done();
            })
            .catch(done);

        requests[0].respond(200, {}, '{}');
    });

    it('Должен устанавливать withCredentials', () => {
        http.get('/test');
        void expect(requests[0].withCredentials).to.be.true;
    });
});
