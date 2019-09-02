import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll();
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails, field required or date is incorrect.',
      });
    }

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      console.log(parseISO(date), new Date());
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
      banner_id,
    });
    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails, field required or date is incorrect.',
      });
    }

    const { title, description, location, date, banner_id } = req.body;

    //  Verifica qual o numero do Id do usuario com o usuario autenticado
    const checkId = await Meetup.findAll({
      raw: true,
      where: { id: req.params.id },
      attributes: ['user_id'],
    });
    if (checkId[0].user_id !== req.userId) {
      return res.status(401).json({ error: 'User not autorizathed!' });
    }

    //  Verifica se a data já passou
    if (isBefore(parseISO(date), new Date())) {
      return res
        .status(400)
        .json({ error: "You can't create a Meetup before today. " });
    }

    const meetupId = await Meetup.findByPk(req.params.id);

    const meetup = await meetupId.update({
      title,
      description,
      location,
      date,
      banner_id,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
