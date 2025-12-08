export const hasRole = (user, roles = []) => {
  if (!user?.roles) return false;
  return roles.some((r) => user.roles.includes(r));
};
