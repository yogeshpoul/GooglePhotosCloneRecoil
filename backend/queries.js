const zod = require("zod");
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./db');  // Import the pool
const validations = require('./zodValidation');
const { s3Client, getObjectUrl, getShareableUrl } = require("./S3AwsMethods");
require('dotenv').config();

// Upload Photo to S3
const uploadPhoto = async (request, response) => {
  const type = request.body.type;
  const imageName = request.body.imageName;
  const email = request.userId;
  const photoKey = `uploads/${email + imageName}`;

  const command = new PutObjectCommand({
    Bucket: "nodejsprivate",
    Key: photoKey,
    ContentType: type,
  });

  try {
    const url = await getSignedUrl(s3Client, command);
    response.send({ url, photoKey });
  } catch (error) {
    response.status(500).send('Error uploading photo', error);
  }
}

// Save Image to Database
const saveImageDb = async (request, response) => {
  const { imageName, photoKey } = request.body;
  const email = request.userId;

  try {
    const result = await pool.query(
      'INSERT INTO "userPhotos" (email, imageName, photoKey) VALUES ($1, $2, $3) RETURNING *',
      [email, imageName, photoKey]
    );


    response.status(201).send({ "message": 'Image registered successfully' });
  } catch (error) {
    console.error('Error registering image:', error.message);
    console.error('Error stack trace:', error.stack);
    response.status(500).send({ "message": 'Error registering image', "error": error.message });
  }
};


const getImageURI = async (request, response) => {
  const email = request.userId;

  try {
    const result = await pool.query('SELECT * FROM "userPhotos" WHERE email = $1', [email]); // Ensure table name is in double quotes if case-sensitive
    const imagesInfo = result.rows;

    if (!imagesInfo.length) {
      return response.status(404).json({ message: 'No images found for this email' });
    }
    const photoUrls = await Promise.all(imagesInfo.map(async (imageInfo) => {
      const photoUrl = await getObjectUrl(imageInfo.photokey);
      const shareableUrl = await getShareableUrl(imageInfo.photokey);

      return {
        photoKey: imageInfo.photokey,
        imageUrl: photoUrl,
        shareableUrl
      };
    }));

    response.status(200).json({ photoUrls });
  } catch (error) {
    console.error('Error getting image:', error.message); // Log the error message
    console.error('Error stack trace:', error.stack); // Log the full error stack trace
    response.status(500).send({ "message": 'Error getting image', "error": error.message });
  }
}


// Delete Image from Database and S3
const deleteImage = async (request, response) => {
  const email = request.userId;
  const photoKey = request.query.photoKey;
  const command = new DeleteObjectCommand({
    Bucket: "nodejsprivate",
    Key: photoKey,
  });
  try {
    const imageInfoResult = await pool.query('SELECT * FROM "userPhotos" WHERE email = $1 AND photoKey = $2', [email, photoKey]);
    const imageInfo = imageInfoResult.rows[0];
    if (!imageInfo) {
      return response.status(404).json({ message: 'Image not found.' });
    }
    const S3DeleteStatus = await s3Client.send(command);
    await pool.query('DELETE FROM "userPhotos" WHERE email = $1 AND photoKey = $2', [email, photoKey]);
    response.status(200).json({ message: 'Image deleted successfully.', S3DeleteStatus });
  } catch (error) {
    response.status(500).json({ message: 'Internal server error.' });
  }
};

const signup = async (request, response) => {
  const { name, email, password } = request.body;

  try {
      validations.signupBody.parse(request.body);
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUserResult = await pool.query(
          'INSERT INTO "Users" (name, email, password, "updatedAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
          [name, email, hashedPassword]
      );

      const token = jwt.sign({ userId: newUserResult.rows[0].email }, process.env.JWT_SECRET);
      response.status(201).json({
          message: "User created successfully",
          token: token,
      });

  } catch (e) {
      console.error("Error in signup function:", e);
      if (e instanceof zod.ZodError) {
          const errorMessages = e.errors.map(err => err.message);
          response.status(500).json({ error: errorMessages });
      } else {
          response.status(500).json({ error: e.message });
      }
  }
}



// User Signin
const signin = async (request, response) => {
  const { email, password } = request.body;

  try {
    validations.signinBody.parse(request.body);
    
    console.log('Sign-in attempt:', email);

    const maxRetries = 3;
    let attempts = 0;
    let userResult;

    while (attempts < maxRetries) {
      try {
        userResult = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        break;  // Exit loop if query is successful
      } catch (err) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, err);
        if (attempts >= maxRetries) throw err;
      }
    }

    const user = userResult.rows[0];

    if (!user) {
      return response.status(401).json({ error: "User doesn't exist. Please create an account." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return response.status(401).json({ error: "Incorrect password." });
    }

    const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET);
    response.status(200).json({
      message: 'Sign-in successful',
      token: token,
    });

  } catch (e) {
    if (e instanceof zod.ZodError) {
      const errorMessages = e.errors.map(err => err.message);
      response.status(500).json({ error: errorMessages });
    } else {
      console.error('Error in signin function:', e);
      response.status(500).json({ error: e.message });
    }
  }
};


const JWTVerifier = async (request, response) => {
  response.status(200).json({ message: "Success" });
}

module.exports = {
  signup,
  signin,
  JWTVerifier,
  uploadPhoto,
  saveImageDb,
  getImageURI,
  deleteImage,
};
