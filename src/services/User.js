class User {}

User.isAuthenticated = () => {
  return localStorage.getItem("accessToken");
};

User.get = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

User.getRoles = () => {
  const user = User.get();
  const roles = user.role ? user.role : [];

  return roles;
};

User.hasRoles = (role) => {
  const roles = role && Array.isArray(role) ? role : [role];
  return User.getRoles().some((el) => roles.some((r) => el === r));
};

User.logout = (path) => {
  localStorage.clear();
  document.location = path ? "#" + path : "/logout";
};

export default User;
