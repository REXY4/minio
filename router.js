const { uploadFile } = require("./uploadFile");
const express = require("express");
const router = express.Router();
// const { Client } = require("./minioClient");
const formidable = require('formidable');
const fs = require('fs');

var Minio = require('minio');
const { sendfile } = require("express/lib/response");

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



// require("./uploads/1650874419370-1174949_js_reactjs_logo_react_reactnative_icon.png");
router.post("/upload", uploadFile("imageFile"),async (req, res) => {
    try {  
        const imageName = req.files.imageFile[0].filename;
        const location = __dirname + `/uploads/${imageName}`;
        const metaData = {
            'Content-Type': "image/png",
          };
        let fileStream = fs.createReadStream(__dirname + `/uploads/${imageName}`);                
        await fs.stat(location, (err2, stats) => {
        if (err2) {
            			return console.log(err)
            		}else{
                        minioClient.putObject(minioBucketName, imageName, fileStream, stats.size, metaData,  function(err3, etag) {
                            			if (err3) {
                            				return res.status(500).send({
                                                status : "failed",
                                                data : err3
                                            });
                            			}else{
                            			return res.send({
                                            status : "success",
                                            message : "send photo success",
                                            data :  `http://localhost:9000/users/${imageName}`
                                        });
                                    }
                            })
                        // minioClient.statObject(minioBucketName, "Screenshot_1645954974.png", function(err, stat) {
                        //     if (err) {
                        //       return res.send({
                        //           status  :"failed",
                        //           data : err
                        //       })
                        //     }
                        //     res.send({
                        //         status : "success",
                        //         data :stat
                        //     });
                          
                        //   })
                    }
    })  
                        
    } catch (error) {
        res.status(500).send({
          status : "error",
          message : error.message
        });
    }
});

router.get("/", async (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

module.exports = router;