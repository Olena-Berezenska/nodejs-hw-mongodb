import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactsById,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';
import fs from 'fs';

export const getContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const { userId } = req.user;
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const { userId } = req.user;
  const contact = await getContactsById(contactId, userId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  try {
    const { userId } = req.user;
    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file);

      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting file:', err);
      });
    }

    const contact = await createContact({
      ...req.body,
      userId,
      photo: photoUrl,
    });
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.log('Error deleting file:', error);
      });
    }
    next(err);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { userId } = req.user;
    const contact = await deleteContact(contactId, userId);
    if (!contact) {
      next(createHttpError(404, 'Contact not found'));
      return;
    }

    if (contact.photo) {
      await deleteFromCloudinary(contact.photo);
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { userId } = req.user;
    let updateData = { ...req.body };

    if (req.file) {
      const oldContact = await getContactsById(contactId, userId);
      if (oldContact && oldContact.photo) {
        await deleteFromCloudinary(oldContact.photo);
      }

      const photoUrl = await uploadToCloudinary(req.file);
      updateData.photo = photoUrl;

      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting file:', err);
      });
    }

    const contact = await updateContact(contactId, updateData, {}, userId);
    if (!contact) {
      next(createHttpError(404, 'Contact not found'));
      return;
    }
    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: contact,
    });
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.log('Error deleting file:', error);
      });
    }
    next(err);
  }
};
