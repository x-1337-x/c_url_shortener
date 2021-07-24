const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const filestore = require('session-file-store')(session);
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');

const Url = require('./models/url');

dotenv.config();

mongoose.connect(
	`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vpj6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	}
);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log(`we're connected!`);
	app.listen(PORT, () => {
		console.log(`The app is running on port ${PORT}`);
	});
	// app.use(
	// 	session({
	// 		secret: process.env.SESSION_SECRET,
	// 		saveUninitialized: false,
	// 		resave: false,
	// 		// store: MongoStore.create(db),
	// 		store: new filestore(),
	// 	})
	// );
});

//TODO maintenance page

const PORT = 8889;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		saveUninitialized: true,
		resave: false,
		// store: MongoStore.create(),
		store: new filestore(),
	})
);

// cron.schedule('*/30 * * * * *', async () => {
// 	let currentDate = new Date(Date.now() - 1800000);
// 	await Url.deleteMany({ lastVisited: { $lt: currentDate } }, (err, log) => {
// 		console.log(err, log);
// 	});
// });

const getRecord = async (alias) => {
	return await Url.findOneAndUpdate(
		{ alias },
		{ lastVisited: Date.now() },
		{ new: true }
	).exec();
};

const getAllRecordsByID = async (sessionID) => {
	return await Url.find({ sessionID });
};

const createAlias = () => {
	let alias = nanoid(7);
	return alias;
};

const createRecord = async (url, alias, sessionID) => {
	if (!alias) alias = createAlias();
	let record;
	let foundConflicts = await Url.findOne({ alias }).exec();
	if (foundConflicts) {
		throw new Error('alias already eists');
	} else {
		record = Url.create({ url, alias, sessionID });
	}
	return record;
};

app.get('/', async (req, res) => {
	console.log(`get / `, req.session);
	console.log(`get / `, req.sessionID);
	let userHistory;
	let linkListHTML;
	if (req.sessionID) {
		userHistory = await getAllRecordsByID(req.sessionID);
		linkListHTML = userHistory.reduce((acc, item) => {
			return (
				acc +
				`<li>${item.url} <br> Shortlink: <a href="http://localhost:${PORT}/${item.alias}">http://localhost:${PORT}/${item.alias}</a></li>`
			);
		}, '');
		console.log(`userHistory: `, userHistory);
		console.log(`linkListHTML: `, linkListHTML);
	}
	const homePage = `<html><head><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo="></head><body>
	<form action="/" method="post" enctype="application/x-www-form-urlencoded" style="padding: 20px; background: #fff;">
		<input name="url" placeholder="URL" />
		<input name="alias" placeholder="Custom Alias" />
		<button type="submit">Create short URL</button>
	</form>
	<ul>${linkListHTML}</ul>
	</body></html>`;
	res.send(homePage);
});

app.get('/:alias', async (req, res) => {
	console.log(`post /:alias `, req.session);
	console.log(`post /:alias `, req.sessionID);
	try {
		let record = await getRecord(req.params.alias);
		if (record) {
			let currentDate = new Date(Date.now());
			console.log(currentDate - record.lastVisited);
			return res.redirect(301, record.url);
		} else {
			return res.sendStatus(400).end();
		}
	} catch (error) {
		return res.sendStatus(500).end();
	}
});

app.post('/', async (req, res) => {
	console.log(`post / `, req.session);
	console.log(`post / `, req.sessionID);
	if (req.body.url) {
		try {
			const { url, alias } = req.body;
			const { sessionID } = req;
			const record = await createRecord(url, alias, sessionID);
			const message = `Here is your short link: <a href="http://localhost:8889/${record.alias}">http://localhost:8889/${record.alias}</a>`;
			return res.send(message);
		} catch (error) {
			return res.sendStatus(500).end();
		}
	} else {
		return res.sendStatus(400).end();
	}
});
