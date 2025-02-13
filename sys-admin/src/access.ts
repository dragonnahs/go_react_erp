export default function(initialState: { currentUser?: API.CurrentUser }) {
  const { currentUser } = initialState;

  return {
    canAdmin: currentUser && currentUser.role === 'admin',
    isUser: currentUser && currentUser.role === 'user',
  };
}
