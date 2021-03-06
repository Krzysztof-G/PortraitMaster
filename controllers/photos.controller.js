const Photo = require('../models/photo.model');
const Vote = require('../models/vote.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg

      const fileExt = fileName.split('.').slice(-1)[0]; // cut extension

      if(title.length <= 25 && author.length <= 50 && (fileExt == 'gif' || fileExt == 'jpg' || fileExt == 'png')){

        let html = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
        let email = RegExp.prototype.test.bind(/^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}$/i);

        if(html(title) === false && email(email) === true){

          const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });

          await newPhoto.save(); // ...save new photo in DB
          res.json(newPhoto);
      }}
    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const clientIp = requestIp.getClientIp(req);
    const existingVote = await Vote.findOne({ user: clientIp });

    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });

    else if(!existingVote){

      newVote = new Vote({ user: clientIp, votes: req.params.id });
      await newVote.save();
      res.json(newVote);

      photoToUpdate.votes++;
      photoToUpdate.save();
      
    }
    else {
      if(existingVote.votes.includes(photoToUpdate._id)){
        res.send('You can vote only once for this photo');

      } else { 

        existingVote.votes.push(photoToUpdate._id)
        existingVote.save();

        photoToUpdate.votes++;
        photoToUpdate.save();

        res.send({ message: 'OK' });
      }
      
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
