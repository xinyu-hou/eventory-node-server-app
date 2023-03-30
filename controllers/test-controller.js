const TestController = (app) => {
    app.get('/hello', (req, res) => {
        res.send("Hello World!");
    });
    app.get('/', (req, res) => {
        res.send("Welcome to CS 5610 Final Project!");
    });
};
export default TestController;