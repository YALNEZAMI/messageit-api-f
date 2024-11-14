import { members } from './members/members'
import { conversations } from './conversations/conversations'
import { myUsers } from './my-users/my-users'
import { friendAcceptations } from './friend-acceptations/friend-acceptations'
import { friends } from './friends/friends'
import { friendRequests } from './friend-requests/friend-requests'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(members)
  app.configure(conversations)
  app.configure(myUsers)
  app.configure(friendAcceptations)
  app.configure(friends)
  app.configure(friendRequests)
  app.configure(user)
  // All services will be registered here
}
