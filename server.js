const express = require("express");
const app = express();
const PORT = 8000;
const routers = require("./router");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routers);
app.use('uploads', express.static('uploads'));
app.get("/", async (req, res) => {
    res.send("Hallo Bri");
});


app.listen(PORT,()=>console.log(`Server is running on PORT ${PORT}`));