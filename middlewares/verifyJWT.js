import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Beare ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESST_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.userId = decoded.id;
    next();
  });
};

export default verifyJWT;
