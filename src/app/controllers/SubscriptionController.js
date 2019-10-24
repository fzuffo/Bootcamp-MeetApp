import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

import SubscriptionMail from '../jobs/SubscriptionMail';

import Queue from '../../lib/Queue';

//  --------- subscribe class start ---------
class SubscriptionController {
  //  -------- index starts --------
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id', 'user_id', 'meetup_id'],
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          include: [
            {
              model: File,
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
        {
          model: User,
          attributes: ['name'],
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }
  //  -------- index ends --------

  //  -------- store starts --------
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
    var checkSameTimeSubscription = [];

    for (let index = 0; index < checkSameTime.length; index++) {
      const elementId = checkSameTime[index].id;

      checkSameTimeSubscription = await Subscription.findAll({
        where: {
          meetup_id: elementId,
        },
      });
    }

    if (checkSameTimeSubscription.length > 0) {
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

    //  -------- Find data for send email starts --------
    const meetupId = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    const subscriptions = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: meetup.id,
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });
    //  -------- Find data for send email ends --------

    //  -------- Queue send email starts --------
    await Queue.add(SubscriptionMail.key, {
      meetupId,
      subscriptions,
    });
    //  -------- Queue send email ends --------

    //  -------- Return result starts --------
    return res.json(subscribed);
    //  -------- Return result ends --------

    //  --------- store ends ---------
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);

    if (subscription === null) {
      return res.status(401).json({ error: 'Subscription not found' });
    }

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({ error: 'User not autorizathed' });
    }

    await subscription.destroy();
    return res.json(subscription);
  }
}
export default new SubscriptionController();
