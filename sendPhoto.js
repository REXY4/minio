const formidable = require('formidable');
const fs = require('fs');

var Minio = require('minio');

let minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'rizki',
    secretKey: 'User1234'
});


let minioBucketName = 'users';

minioClient.bucketExists(minioBucketName, function(err) {
	if (err) {
		if (err.code == 'NoSuchBucket') {
			minioClient.makeBucket(minioBucketName, 'us-east-1', function(err2) {
				if (err2) {
					console.log("error on creating bucket", err2);
				}
			});
		}
	}
	console.log('Bucket exists:', minioBucketName);
});

module.exports = {

	uploadImage(req, res, next) {

		const form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			const myfile = files.myfile;
			var fileStream = fs.createReadStream(myfile.path);
			var fileStat = fs.stat(myfile.path, function(err2, stats) {
				if (err2) {
					return console.log(err)
				}
				minioClient.putObject(minioBucketName, myfile.name, fileStream, stats.size, function(err3, etag) {
					if (err3) {
						return res.status(500).send(err3);
					}
					return res.send(etag);
				})
			});
		});
	},

	getImage(req, res, next) {
		let data;
		minioClient.getObject(minioBucketName, req.params.id, function(err, objStream) {
			if (err) {
				return console.log(err)
			}
			objStream.on('data', function(chunk) {
				data = !data ? new Buffer(chunk) : Buffer.concat([data, chunk]);
			})
			objStream.on('end', function() {
				res.writeHead(200, {'Content-Type': 'image/jpeg'});
				res.write(data);
				res.end();
			})
			objStream.on('error', function(err) {
				res.status(500);
				res.send(err);
			})
		});
	}

};