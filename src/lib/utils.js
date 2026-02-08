import jwt from "jsonwebtoken";

export const generateToken = (userId, cookieStore) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  cookieStore.set({
    name: "token",
    value: token,
    maxAge: 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
  });

  return token;
};

export const authenticateToken = (cookieStore) => {
  const token = cookieStore.get("token").value;

  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      return decoded.userId;
    }
    return false;
  } catch (error) {
    return false;
  }
};
