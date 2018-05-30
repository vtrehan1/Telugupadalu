const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const databaseFunctions = require('./database');

const PORT = 3000;

const app = express();

const { addNewWord, searchForWord } = databaseFunctions;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

/* Setting view engine to EJS */
app.set('view engine', 'ejs');

/* Setting up directory to hold static assets (e.g. CSS) */
app.use(express.static(__dirname + '/public'));

/* Endpoint to add a new Telugu word to the dictionary */
app.post('/new/word', function (req, res) {

    const {
        synonymArray,
        linkArray,
        teluguWord,
        teluguSentence,
        englishTranslation } = req.body;

    addNewWord(synonymArray, linkArray, teluguWord, teluguSentence, englishTranslation);

    res.status(200).end();

});

/* Endpoint to search dictionary for userEntry */
app.get('/search/:userEntry', function (req, res){

    const { userEntry } = req.params;
    const { language } = req.query;
 
    searchForWord(userEntry, language).then(response => {
        res.status(200).send(response);
    });
});

/* Endpoint to request home page */
app.get('/', function (req, res){

    res.render(`pages/home`);
});

/* Endpoint to request other pages */
app.get('/:page', function (req, res){

    const { page } = req.params;

    res.render(`pages/${page}`);
});

app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});