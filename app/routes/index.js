const routes = require('./routes.js');

module.exports = function(app, collection) {
    routes(app, collection);
}