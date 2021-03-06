const Sauce = require('../models/Sauce'); // Importation du model/schema Sauce
const fs = require('fs'); //package fs (gestion fichiers importés)


//MIDDLEWARE CREATION D'UNE SAUCE
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

//MIDDLEWARE RECUPERATION D'UNE SEULE SAUCE (via ID)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => { res.status(200).json(sauce); }
  ).catch(
    (error) => { res.status(404).json({ error: error }) }
  )
};

//MIDDLEWARE MODICIFICATION D'UNE SAUCE
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

//MIDDLEWARE SUPPRESSION D'UNE SAUCE
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//MIDDLEWARE RECUPERATION DE TOUTES LES SAUCES DE LA BASE DE DONNEES
exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => { res.status(200).json(sauces); }
  ).catch(
    (error) => { res.status(400).json({ error: error }); }
  )
};

//MIDDLEWARE SYSTEME DE LIKE ET DISLIKE D'UNE SAUCE
exports.likeSauce = (req, res, next) => {

  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  // ajout d'un like
  if (like === 1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $push: { usersLiked: userId },
        $inc: { likes: +1 },
      }
    )
      .then(() => res.status(200).json({ message: 'J\'aime !' }))
      .catch((error) => res.status(400).json({ error }))
  }
  // ajout d'un dislike
  if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $push: { usersDisliked: userId },
        $inc: { dislikes: +1 },
      }
    )
      .then(() => {
        res.status(200).json({ message: 'Je n\'aime pas !' })
      })
      .catch((error) => res.status(400).json({ error }))
  }
  // annulation du like ou dislike
  if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersLiked: userId },
              $inc: { likes: -1 },
            }
          )
            .then(() => res.status(200).json({ message: 'Like retiré !' }))
            .catch((error) => res.status(400).json({ error }))
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            {
              $pull: { usersDisliked: userId },
              $inc: { dislikes: -1 }
            }
          )
            .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
            .catch((error) => res.status(400).json({ error }))
        }
      })
      .catch((error) => res.status(404).json({ error }))
  }
}