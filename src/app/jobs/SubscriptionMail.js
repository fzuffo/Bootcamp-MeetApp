import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetupId, subscriptions } = data;

    await Mail.sendMail({
      to: `${meetupId.User.name} <${meetupId.User.email}>`,
      subject: 'Novo inscrito no meetup',
      template: 'subscriptions',
      context: {
        owner: meetupId.User.name,
        meetupId: meetupId.id,
        meetupTitle: meetupId.title,
        date: format(
          parseISO(meetupId.date),
          " 'dia 'dd 'de' MMMM 'de' yyyy', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        userName: subscriptions.User.name,
        userEmail: subscriptions.User.email,
      },
    });
  }
}
export default new SubscriptionMail();
