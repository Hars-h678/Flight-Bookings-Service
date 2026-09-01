const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());// now this will act as middleware for everyumcoing request
app.use(express.urlencoded({extended:true}));// this will help to parse the data coming from form submission
app.use ('/api',apiRoutes)

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});
