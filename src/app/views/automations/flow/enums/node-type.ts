export enum NodeType {
  // Triggers
  SubscriberJoinsGroup = 'SUBSCRIBER_JOINS_GROUP',
  TagAdded = 'TAG_ADDED',
  TagRemoved = 'TAG_REMOVED',
  EmailOpened = 'EMAIL_OPENED',
  Unsubscribed = 'UNSUBSCRIBED',

  // Actions
  SendEmail = 'SEND_EMAIL',
  Wait = 'WAIT',
  AddToGroup = 'ADD_TO_GROUP',
  RemoveFromGroup = 'REMOVE_FROM_GROUP',
  AddTag = 'ADD_TAG',
  RemoveTag = 'REMOVE_TAG',

  // Conditions
  Condition = 'CONDITION',
}
