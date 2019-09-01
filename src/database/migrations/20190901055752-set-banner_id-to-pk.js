module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('meetups', 'banner_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('meetups', 'banner_id');
  },
};
