require('dotenv').config();
const express = require('express');
const Note = require('./models/note');

const app = express();
app.use(express.static('dist'));
app.use(express.json());

const requestLogger = (req, response, next) => {
  console.log('Method:', req.method);
  console.log('Path:  ', req.path);
  console.log('Body:  ', req.body);
  console.log('---');
  next();
};
app.use(requestLogger);

let notes = [
  {
    id: '1',
    content: 'HTML is easy',
    important: true,
  },
  {
    id: '2',
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: '3',
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

app.get('/', (req, res) => {
  res.status(200).send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;
  Note.findById(id)
    .then((note) => {
      if (note) {
        return res.json(note);
      } else {
        return res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body;

  Note.findById(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save().then((updatedNote) => {
        res.json(updatedNote);
      });
    })
    .catch((err) => next(err));
});

app.delete('/api/notes/:id', (req, res, next) => {
  const id = req.params.id;
  Note.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch((err) => next(err));
});

app.post('/api/notes', (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const note = Note.create({
    content: body.content,
    important: body.important || false,
  });

  note.then((savedNote) => res.json(savedNote));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  next(err);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
