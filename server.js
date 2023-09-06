import express from 'express';
import routes from './routes/index';
import e from 'express';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({limit: "10mb", extended: true}));
app.use(express.urlencoded({limit: "10mb", extended: true}));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
