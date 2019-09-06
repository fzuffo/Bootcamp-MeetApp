import { isBefore } from 'date-fns';
import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import Mail from '../../lib/Mail';

//  --------- subscribe class start ---------

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId);

    //  -------- Check past date starts --------
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(401)
        .json({ error: 'This meetup has already happened.' });
    }
    //  -------- Check past date ends --------

    //  -------- Check if already subscribed starts --------
    const checkSubscribed = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: req.params.meetupId,
      },
    });
    if (checkSubscribed) {
      return res
        .status(401)
        .json({ error: 'You had ever been register on this Meetup.' });
    }
    //  -------- Check if already subscribed ends --------

    //  -------- Check same time starts --------
    const checkSameTime = await Meetup.findAll({
      where: {
        id: { [Op.ne]: req.params.meetupId },
        date: meetup.date,
      },
    });

    if (checkSameTime.length > 0) {
      return res
        .status(400)
        .json({ error: 'You have other Meetup at same time.' });
    }
    //  -------- Check same time ends --------

    //  -------- Create in model starts --------
    const subscribed = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });
    //  -------- Create in model ends --------

    //  -------- Send mail starts --------
    const meetupId = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });
    await Mail.sendMail({
      to: `${meetupId.User.name} <${meetupId.User.email}>`,
      subject: 'Novo inscrito no meetup',
      text: 'Novo inscrito no meetup',
    });
    //  -------- Send mail starts --------

    //  -------- Return result starts --------
    return res.json(subscribed);
    //  -------- Return result ends --------

    //  --------- subscribe class end ---------

    //  --------- new class starts ---------
  }
}
export default new SubscriptionController();
