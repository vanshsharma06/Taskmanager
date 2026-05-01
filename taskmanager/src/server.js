require('dotenv').config();
const express = require('express');
const cors = require('cors');
const models = require('./models');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project')
const taskRoutes = require('./routes/task')
const teamRoutes = require('./routes/team')
const userRoutes = require('./routes/user')
const performanceRoutes = require('./routes/performance')

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/users', userRoutes)
app.use('/api/performance', performanceRoutes)

app.get('/', (req, res) => res.send('Team Task Manager API'));

const PORT = process.env.PORT || 3000;
models.sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));