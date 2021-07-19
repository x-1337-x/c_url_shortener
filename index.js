const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const dotenv = require('dotenv');

const Url = require('./models/url');

dotenv.config();

mongoose.connect(
	`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vpj6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log(`we're connected!`);
	app.listen(PORT, () => {
		console.log(`The app is running on port ${PORT}`);
	});
});

//TODO maintenance page

const PORT = 8889;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const getRecord = async (alias) => {
	return await Url.findOne({ alias }).exec();
};

const createAlias = () => {
	let alias = nanoid(7);
	return alias;
};

const createRecord = async (url, alias = createAlias()) => {
	let record;
	let foundConflicts = await Url.findOne({ alias }).exec();
	if (foundConflicts) {
		throw new Error('alias already eists');
	} else {
		record = Url.create({ url, alias });
	}
	return record;
};

app.get('/', function (req, res) {
	const formPage = `<html><head><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo="></head><body>
	<form action="/" method="post" enctype="application/x-www-form-urlencoded" style="padding: 20px; background: #fff;">
		<input name="url" placeholder="URL" />
		<input name="alias" placeholder="Custom Alias" />
		<button type="submit">Create short URL</button>
	</form>
	</body></html>`;
	res.send(formPage);
});

app.get('/:alias', async (req, res) => {
	try {
		let url = await getRecord(req.params.alias);
		if (url) {
			return res.redirect(301, url.url);
		} else {
			return res.status(400).end();
		}
	} catch (error) {
		return res.send(500).end();
	}
});

app.post('/', async (req, res) => {
	if (req.body.url) {
		try {
			const { url, alias } = req.body;
			const record = await createRecord(url, alias);
			const message = `Here is your short link: <a href="http://localhost:8889/${record.alias}">http://localhost:8887/${record.alias}</a>`;
			return res.send(message);
		} catch (error) {
			return res.status(500).end();
		}
	} else {
		return res.status(400).end();
	}
});
