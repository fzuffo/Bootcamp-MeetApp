import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['id'],
    });
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

    // //  Verifica qual o numero do Id do usuario com o usuario autenticado
    const meetup = await Meetup.findByPk(req.params.id);

    const user_id = req.userId;

    if (user_id !== meetup.user_id) {
      return res.status(401).json({ error: 'User not autorizathed!' });
    }

    //  Verifica se a data já passou
    if (isBefore(req.body.date, new Date())) {
      return res.status(401).json({ error: "Can't update past date." });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'This meetup is past.' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    // const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    //  verificar se é do proprio usuario
    if (meetup.user_id !== req.userId) {
      return res.status(401).json({ error: 'User not autorizathed' });
    }

    //  verificar se a data já passou **TESTAR
    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'This meetup is past.' });
    }

    //  deletar do banco de dados
    await meetup.destroy();
    return res.json(meetup);
  }
}
export default new MeetupController();
