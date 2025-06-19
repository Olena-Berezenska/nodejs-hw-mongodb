import { contactsCollection } from '../db/models/contactsModel.js';

export const getAllContacts = async () => {
  const contacts = await contactsCollection.find();
  return contacts;
};
export const getContactsById = async (contactId) => {
  const contact = await contactsCollection.findById(contactId);
  return contact;
};
export const createContact = async (payload) => {
  const newcontact = await contactsCollection.create(payload);
  return newcontact;
};
export const deleteContact = async (contactId) => {
  const contact = await contactsCollection.findOneAndDelete({
    _id: contactId,
  });
  return contact;
};
export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await contactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
