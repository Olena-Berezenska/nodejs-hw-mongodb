import { contactsCollection } from '../db/models/contactsModel.js';

export const getAllContacts = async () => {
  const contacts = await contactsCollection.find();
  return contacts;
};
export const getContactsById = async (contactId) => {
  const contact = await contactsCollection.findById(contactId);
  return contact;
};
