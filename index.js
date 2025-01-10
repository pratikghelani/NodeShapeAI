const TeachableMachine = require("@sashido/teachablemachine-node");
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use("/model", express.static(path.join(__dirname, "model")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Start the server
const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));
    const model = new TeachableMachine({
      modelUrl: `http://localhost:${PORT}/model/`,
    });

    model.classify({ imageUrl: "http://localhost:3000/assets/1.jpg" }).then((predictions) => {
      const highestPrediction = predictions.reduce((max, prediction) => {
        return (prediction.score > max.score) ? prediction : max;
      });
      console.log("Predicted class:", highestPrediction.class);
      getImageDimensionsFromUrl("http://localhost:3000/assets/1.jpg")
        .then((dimensions) => {
          if (dimensions) {
            console.log("Image dimensions:", dimensions);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }).catch((e) => {
      console.error("ERROR:", e);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
const getImageDimensionsFromUrl = async (imageUrl) => {
  try {

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    const metadata = await sharp(imageBuffer).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (err) {
    console.error("Error getting image dimensions:", err);
    return null;
  }
};

start();
