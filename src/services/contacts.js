import { SORT_ORDER } from '../constants/index.js';
import { contactsCollection } from '../db/models/contactsModel.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactsQuery = contactsCollection.find({ userId });
  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }
  const contactsCount = await contactsCollection
    .find({ userId })
    .merge(contactsQuery)
    .countDocuments();
  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};
export const getContactsById = async (contactId, userId) => {
  const contact = await contactsCollection.findOne({
    _id: contactId,
    userId,
  });
  return contact;
};
export const createContact = async (payload) => {
  const newContact = await contactsCollection.create(payload);
  return newContact;
};
export const deleteContact = async (contactId, userId) => {
  const contact = await contactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};
export const updateContact = async (contactId, payload, options, userId) => {
  const rawResult = await contactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return rawResult.value;
};
