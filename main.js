require('dotenv').config();
var axios = require('axios');

const shotstackUrl = 'https://api.shotstack.io/v1/';
const shotstackApiKey = process.env.SHOTSTACK_API_KEY;

var json = require('./watermark.json');

var renderVideo = function(json) {
	return new Promise ((resolve, reject) => {
		axios({
			method: 'post',
			url: shotstackUrl + 'render',
			headers: {
				'x-api-key': shotstackApiKey,
				'content-type': 'application/json'            
			},
			data: json
		})
		.then((response) => {
			return resolve(response.data)
		}), (err) => {
			return reject(err)
		}
	})
}

var pollVideoStatus = function(uuid) {
	axios({
		method: 'get',
		url: shotstackUrl + 'render/' + uuid,
		headers: {
			'x-api-key': shotstackApiKey,
			'content-type': 'application/json'            
		},
	})
	.then((response) => {
		if (!(response.data.response.status === 'done' || response.data.response.status === 'failed')) {
			setTimeout(function () {
				console.log(response.data.response.status + '...');
				pollVideoStatus(uuid);
			}, 3000);	
		} else if (response.data.response.status === 'failed') {
			console.error('Failed with the following error: ' + response.data.response.error);
		} else {
			console.log('Succeeded: ' + response.data.response.url);
		}
	}, (err) => {
		console.error(err)
	});
}

async function main() {

	let render;
	let response;

	try {
		render = await renderVideo(JSON.stringify(json));

		pollVideoStatus(render.response.id);
	} catch(err) {
		console.error(err);
	}

}

main();