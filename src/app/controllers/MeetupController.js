import * as Yup from 'yup';
import { parseISO, isBefore, endOfDay, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  //  -------- index starts --------

  async indexUser(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
        {
          model: File,
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    if (meetups.length === 0) {
      return res.status(400).json({ error: 'No meetups find.' });
    }

    return res.json(meetups);
  }

  async index(req, res) {
    const { page = 1, date } = req.query;
    const searchDate = parseISO(date);

    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      where: {
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: ['date'],
      // order: [['date', 'desc']],  syntax for sort descrescent
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
        {
          model: File,
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    if (meetups !== []) {
      return res.json(meetups);
    }
    return res.status(400).json({ error: 'No meetups find.' });
  }

  //  -------- index ends --------

  //  -------- store starts --------
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails, field required or date is incorrect.',
      });
    }

    const { title, description, location, date, file_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: "You can't create a Meetup before today. " });
    }
    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      user_id: req.userId,
      file_id,
    });
    return res.json(meetup);
  }
  //  -------- store ends --------

  //  -------- update starts --------
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails, field required or date is incorrect.',
      });
    }

    // Check if user id is same auth user.
    const meetup = await Meetup.findByPk(req.params.id);
    const { title, description, location, date, file_id } = req.body;

    if (req.userId !== meetup.user_id) {
      return res.status(401).json({ error: 'User not autorizathed!' });
    }

    //  Check is date is past.
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(401)
        .json({ error: "You can't create a Meetup before today." });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'This meetup is past.' });
    }

    await meetup.update({
      title,
      description,
      location,
      date: parseISO(date),
      file_id,
    });

    return res.json(meetup);
  }
  //  -------- update ends --------

  //  -------- delete starts --------
  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    //  Check if is user is itself
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'User not autorizathed' });
    }

    //  Check if date past
    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'This meetup is past.' });
    }

    //  Delete from database
    await meetup.destroy();
    return res.json(meetup);

    //  -------- delete ends --------
  }
}
export default new MeetupController();
