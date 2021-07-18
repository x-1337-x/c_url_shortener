const express = require('express');

const PORT = 8889;

const app = express();

const { nanoid } = require('nanoid');

class DataBase {
	constructor() {
		this.storage = [];
	}

	getRecord(alias) {
		return this.storage.find((el) => {
			return el.alias === alias;
		});
	}

	createAlias() {
		let alias = nanoid(7);
		return alias;
	}

	createRecord(url) {
		let alias;
		let counter = 0;
		let found;
		do {
			counter++;
			alias = this.createAlias();
			found = this.getRecord(alias);
		} while (counter < 100 && found);
		if (found) {
			throw new Error('failed to geterate a unique alias');
		}
		let record = { url, alias };
		this.storage.push(record);
		return record;
	}
}

const DB = new DataBase();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function (req, res) {
	const formPage = `<html><head><link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo="></head><body>
	<form action="/" method="post" enctype="application/x-www-form-urlencoded" style="padding: 20px; background: #fff;">
		<input name="url" placeholder="" />
		<button type="submit">Create short URL</button>
	</form>
	</body></html>`;
	res.send(formPage);
});

app.get('/:alias', (req, res) => {
	let url = DB.getRecord(req.params.alias);
	if (url) {
		return res.redirect(301, url.url);
	} else {
		return res.status(400).end();
	}
});

app.post('/', (req, res) => {
	if (req.body.url) {
		try {
			const record = DB.createRecord(req.body.url);
			const message = `Here is your short link: <a href="http://localhost:8889/${record.alias}">http://localhost:8887/${record.alias}</a>`;
			return res.send(message);
		} catch (error) {
			return res.status(500).end();
		}
	} else {
		return res.status(400).end();
	}
});

app.listen(PORT, () => {
	console.log(`The app is running on port ${PORT}`);
});
