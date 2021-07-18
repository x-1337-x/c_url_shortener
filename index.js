const express = require('express');

const PORT = 8889;

const app = express();

class DataBase {
	constructor() {
		this.storage = [];
		this.id = 1;
	}

	getRecord(alias) {
		return this.storage.find((el) => {
			return el.alias === alias;
		});
	}

	createAlias(url) {
		let alias = String(this.id++);
		return alias;
	}

	createRecord(url) {
		let record = { url, alias: this.createAlias(url) };
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
		return res.send(url);
	} else {
		return res.status(400).end();
	}
});

app.post('/', (req, res) => {
	if (req.body.url) {
		const record = DB.createRecord(req.body.url);
		const message = `Here is your short link: <a href="http://localhost:8889/${record.alias}">http://localhost:8887/${record.alias}</a>`;
		return res.send(message);
	} else {
		return res.status(400).end();
	}
});

app.listen(PORT, () => {
	console.log(`The app is running on port ${PORT}`);
});
