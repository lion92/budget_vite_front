const KEY = 'ticket_links';

export const getTicketLinks = () => JSON.parse(localStorage.getItem(KEY) || '{}');

export const setTicketLink = (expenseId, ticketId, fileName) => {
  const links = getTicketLinks();
  links[String(expenseId)] = { ticketId, fileName };
  localStorage.setItem(KEY, JSON.stringify(links));
};

export const removeTicketLink = (expenseId) => {
  const links = getTicketLinks();
  delete links[String(expenseId)];
  localStorage.setItem(KEY, JSON.stringify(links));
};

export const getTicketForExpense = (expenseId) =>
  getTicketLinks()[String(expenseId)] || null;

export const getTicketUrl = (ticketId) =>
  `https://www.krisscode.fr/ticket/image/${ticketId}`;
