export enum NodeType {
  // Triggers
  SubscriberJoinsGroup = 'SUBSCRIBER_JOINS_GROUP',
  FormSubmitted = 'FORM_SUBMITTED',
  LinkClicked = 'LINK_CLICKED',
  FieldUpdated = 'FIELD_UPDATED',
  TagAdded = 'TAG_ADDED',
  TagRemoved = 'TAG_REMOVED',
  EmailOpened = 'EMAIL_OPENED',
  Unsubscribed = 'UNSUBSCRIBED',
  DateBased = 'DATE_BASED',

  // Actions
  SendEmail = 'SEND_EMAIL',
  Wait = 'WAIT',
  AddToGroup = 'ADD_TO_GROUP',
  RemoveFromGroup = 'REMOVE_FROM_GROUP',
  AddTag = 'ADD_TAG',
  RemoveTag = 'REMOVE_TAG',
  UpdateField = 'UPDATE_FIELD',
  SendWebhook = 'SEND_WEBHOOK',
  SendNotification = 'SEND_NOTIFICATION',

  // Conditions
  Condition = 'CONDITION',
  IfElse = 'IF_ELSE',
  Split = 'SPLIT',

  // Goals
  Goal = 'GOAL',
}
