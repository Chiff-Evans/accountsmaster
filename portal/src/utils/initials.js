// "Accounts Master" -> "AM"; used for the logo and avatar badges.
export const initials = name => (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
