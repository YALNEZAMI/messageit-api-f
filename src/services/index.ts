import { messageSeen } from './message-seen/message-seen'
import { messageRecieving } from './message-recieving/message-recieving'
import { isTyping } from './is-typing/is-typing'
import { messageVisibility } from './message-visibility/message-visibility'
import { messages } from './messages/messages'
import { members } from './members/members'
import { conversations } from './conversations/conversations'
import { friendAcceptations } from './friend-acceptations/friend-acceptations'
import { friends } from './friends/friends'
import { friendRequests } from './friend-requests/friend-requests'
import { user } from './users/users'
import { myUsers } from './my-users/my-users'

// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(messageSeen)
  app.configure(messageRecieving)
  app.configure(isTyping)
  app.configure(messageVisibility)
  app.configure(messages)
  app.configure(members)
  app.configure(conversations)
  app.configure(friendAcceptations)
  app.configure(friends)
  app.configure(friendRequests)
  app.configure(user)
  app.configure(myUsers)

  // All services will be registered here
}
