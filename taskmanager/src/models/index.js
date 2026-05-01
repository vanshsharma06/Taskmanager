const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const cfg = require('../../config/config');

const env = process.env.NODE_ENV || 'development';
const dbCfg = cfg[env];

let sequelize = dbCfg.url
  ? new Sequelize(dbCfg.url, { dialect: 'postgres', dialectOptions: dbCfg.dialectOptions, logging: false })
  : new Sequelize(dbCfg.database, dbCfg.username, dbCfg.password, dbCfg);

const db = {};

fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'))
  .forEach(f => {
    const m = require(path.join(__dirname, f))(sequelize);
    db[m.name] = m;
  });

if (db.User && db.Team) {
  db.User.belongsToMany(db.Team, { through: 'UserTeams', as: 'teams', foreignKey: 'userId', otherKey: 'teamId' });
  db.Team.belongsToMany(db.User, { through: 'UserTeams', as: 'members', foreignKey: 'teamId', otherKey: 'userId' });
}
if (db.Project && db.Team) {
  db.Project.hasMany(db.Team, { foreignKey: 'projectId' });
  db.Team.belongsTo(db.Project, { foreignKey: 'projectId' });
}
if (db.Project && db.Task) {
  db.Project.hasMany(db.Task, { foreignKey: 'projectId' });
  db.Task.belongsTo(db.Project, { foreignKey: 'projectId' });
}
if (db.Team && db.Task) {
  db.Team.hasMany(db.Task, { foreignKey: 'teamId' });
  db.Task.belongsTo(db.Team, { foreignKey: 'teamId' });
}
if (db.User && db.Task) {
  db.User.hasMany(db.Task, { foreignKey: 'assignedTo' });
  db.Task.belongsTo(db.User, { as: 'assignee', foreignKey: 'assignedTo' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;