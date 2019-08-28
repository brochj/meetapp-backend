import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async index(req, res) {
    return res.json({ ok: true });
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });
    const user = await User.findByPk(req.userId);
    // TODO verificar se o meetup existe

    // Checks if the logged user is the meetup creator
    if (user.id === meetup.user_id) {
      return res.status(401).json({
        error: "Can't subscribe to you own meetups",
      });
    }

    // Checks if the meeting has happened
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to a meeting that happened." });
    }

    // Checks is the logged user is trying to subscribe to two meetups at the same time.
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
