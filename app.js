const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const { ExpressError, errorHandler} = require('./utils');
const listsRoutes = require('./routes/lists');
const partiesRoutes = require('./routes/parties');

// -------------- Mongoose -----------
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';

const db = mongoose.connection;
mongoose.connect(mongoDBUrl);

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

const sessionConfig = {
    secret: 'thisisjustatemporarysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7 * 31,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 31
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/', (req, res) => {
    res.render('home');
});

app.use('/lists', listsRoutes);
app.use('/parties', partiesRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  })


app.use(errorHandler);

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})