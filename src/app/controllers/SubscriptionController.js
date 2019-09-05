import { isBefore, isSameHour } from 'date-fns';
import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

//  --------- subscribe class start ---------

class SubscriptionController {
  async subscribe(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(401)
        .json({ error: 'This meetup has already happened.' });
    }

    const user_id = req.userId;
    const meetup_id = req.params.id;

    const listOthersMeetupsId = await Meetup.findAll({
      where: {
        id: {
          [Op.ne]: [req.params.id],
        },
        date: {
          [Op.in]: [meetup.date],
        },
      },
      attributes: ['date'],
    });

    // if (isSameHour(meetup.date, parseISO(listOthersMeetupsId.date))) {
    //   return res
    //     .status(401)
    //     .json({ error: 'You have other Meetup at same hour.' });
    // }

    console.log(listOthersMeetupsId);

    const checkSubscribed = await Subscription.findOne({
      where: { user_id, meetup_id },
    });

    if (checkSubscribed) {
      return res
        .status(401)
        .json({ error: 'You had ever been register on this Meetup.' });
    }

    const subscribed = await Subscription.create({
      user_id,
      meetup_id,
    });

    return res.json(subscribed);
  }

  //  --------- subscribe class end ---------

  //  --------- new class start ---------
}

export default new SubscriptionController();
