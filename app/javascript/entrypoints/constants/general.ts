const fields = {
  USERNAME: 'username',
  PASSWORD: 'password',
  TITLE: 'title',
  DESCRIPTION: 'description',
  DUE_DATE: 'dueDate'
}

const eventTypes = {
  LOGINUSER: 'LOGINUSER',
  COMPLETETASK: 'COMPLETETASK',
  UPDATETASK: 'UPDATETASK',
  DELETETASK: 'DELETETASK',
}

const fieldTexts = {
  EDIT: 'Edit',
  DELETE: 'Delete',
  UPDATE: 'Update',
  TITLE_TITLE: 'Title',
  DESCRIPTION_TITLE: 'Description',
  DUE_DATE_TITLE: 'Due Date',
}

export default {
  eventTypes,
  fields,
  fieldTexts,
}