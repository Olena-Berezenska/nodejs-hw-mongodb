// src/utils/parseFilterParams.js

const parseContactType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;
  const iscontactType = (contactType) =>
    ['work', 'home', 'personal'].includes(contactType);

  if (iscontactType(contactType)) return contactType;
};

const parseFavourite = (isFavourite) => {
  if (typeof isFavourite === 'boolean') return isFavourite;

  if (typeof isFavourite === 'string') {
    if (isFavourite === 'true') return true;
    if (isFavourite === 'false') return false;
  }

  return undefined;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedContactType = parseContactType(contactType);
  const parsedFavourite = parseFavourite(isFavourite);

  return {
    contactType: parsedContactType,
    isFavourite: parsedFavourite,
  };
};
