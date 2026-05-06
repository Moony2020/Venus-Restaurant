import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (_req, res) => {
  const items = await MenuItem.find().sort({ createdAt: -1 });
  res.json(items);
};

export const getLunchOfTheDay = async (_req, res) => {
  const lunch = await MenuItem.findOne({ lunchOfDay: true });
  res.json(lunch);
};
