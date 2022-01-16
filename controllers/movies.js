const Movies = require('../models/movies');
const messages = require('../errors/errorsMessages');
const NotFoundError = require('../errors/not-found');
const BadRequestError = require('../errors/bad-request');
const ForbiddenError = require('../errors/forbidden');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movies.find({ owner }).then((movies) => {
    res.status(200).send(movies);
  })
    .catch(next);
};

const addMovie = (req, res, next) => {
  const {
    country, director, duration, year,
    description, image, trailer, nameRU,
    nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;
  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(messages.badRequestError);
      }
      next(err);
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  const { movieId } = req.params;

  Movies.findById(movieId)
    .orFail(new NotFoundError(messages.notFoundError))
    .then((movie) => {
      if (JSON.stringify(movie.owner) !== JSON.stringify(owner)) {
        throw new ForbiddenError(messages.forbiddenError);
      } else {
        Movies.deleteOne({ _id: movieId })
          .then(() => res.send({ movie }))
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        next(err);
      } else if (err.statusCode === 403) {
        next(err);
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  deleteMovie,
  addMovie,
};
