import { isBefore } from 'date-fns';
import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

//  --------- subscribe class start ---------

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.id);

    //  Check past date -> start
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(401)
        .json({ error: 'This meetup has already happened.' });
    }
    //  Check past date -> end

    // Check if already subscribed -> start.
    const checkSubscribed = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: req.params.id,
      },
    });
    if (checkSubscribed) {
      return res
        .status(401)
        .json({ error: 'You had ever been register on this Meetup.' });
    }
    // Check if already subscribed -> end.

    //  Check same time -> start
    const checkSameTime = await Meetup.findAll({
      where: {
        id: { [Op.ne]: req.params.id },
        date: meetup.date,
      },
    });
    // console.log(checkSameTime.length);
    if (checkSameTime.length > 0) {
      return res
        .status(400)
        .json({ error: 'You have other Meetup at same time.' });
    }
    //  Check same time -> end

    // Create in model
    const subscribed = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscribed);

    //  --------- subscribe class end ---------

    //  --------- new class start ---------
  }
}
export default new SubscriptionController();
