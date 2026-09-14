import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../prisma.js";
import {
  JWT_SECRET,
  FRONTEND_URL,
  RESET_TOKEN_EXPIRES_MINUTES,
  GOOGLE_CLIENT_ID,
} from "../config.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";
import logger from "../utils/logger.js";

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: String(username) },
        { email: String(username).toLowerCase().trim() },
      ],
    },
    include: { store: true },
  });
  if (!user || !user.activo)
    return res.status(401).json({ error: "Credenciales inválidas" });
  if (!(await bcrypt.compare(String(password), user.password)))
    return res.status(401).json({ error: "Credenciales inválidas" });
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      storeId: user.storeId,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "8h" },
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json({
    user: {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      storeId: user.storeId,
      storeName: user.store?.name || "",
    },
  });
}

function buildAuthResponse(user, store) {
  return {
    id: user.id,
    username: user.username,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    storeId: user.storeId,
    storeName: store?.name || "",
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      storeId: user.storeId,
    },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "8h" },
  );
}

export async function register(req, res) {
  const { username, password, email, nombre, storeCode, storeName } = req.body;

  if (!password || !email || !nombre)
    return res
      .status(400)
      .json({ error: "Nombre, correo y contraseña son requeridos" });
  if (String(password).length < 6)
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 6 caracteres" });

  const emailClean = String(email).toLowerCase().trim();
  const usernameClean = username ? String(username) : "";
  const existe = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameClean }, { email: emailClean }],
    },
  });

  if (existe) {
    return res.status(400).json({ error: "El usuario o email ya existe" });
  }

  let store;
  let role = "vendedor";

  if (storeName) {
    const code = String(storeCode || "").trim().toUpperCase();
    if (!code)
      return res
        .status(400)
        .json({ error: "El código de la tienda es requerido" });
    const existStore = await prisma.store.findUnique({ where: { code } });
    if (existStore)
      return res.status(400).json({ error: "El código de tienda ya existe" });

    const hash = await bcrypt.hash(String(password), 10);
    const result = await prisma.$transaction(async (tx) => {
      const newStore = await tx.store.create({
        data: { code, name: String(storeName).trim() },
      });
      let ownerUsername = String(username || "");
      if (!ownerUsername) {
        ownerUsername = emailClean.split("@")[0] || "admin";
        let n = 1;
        let candidate = ownerUsername;
        while (await tx.user.findUnique({ where: { username: candidate } })) {
          candidate = n > 1 ? `${ownerUsername}${n}` : `${ownerUsername}${Math.floor(Math.random() * 900 + 100)}`;
          n++;
        }
        ownerUsername = candidate;
      }
      const owner = await tx.user.create({
        data: {
          username: ownerUsername,
          password: hash,
          nombre: String(nombre),
          email: emailClean,
          rol: "admin",
          storeId: newStore.id,
        },
      });
      return { newStore, owner };
    });
    store = result.newStore;
    const token = signToken(result.owner);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      user: buildAuthResponse(result.owner, store),
    });
  }

  if (!username)
    return res.status(400).json({ error: "El usuario es requerido" });
  if (!storeCode)
    return res
      .status(400)
      .json({ error: "El código de tienda es requerido" });
  store = await prisma.store.findUnique({
    where: { code: String(storeCode).trim().toUpperCase() },
  });
  if (!store) {
    return res.status(400).json({ error: "Código de tienda inválido" });
  }

  const hash = await bcrypt.hash(String(password), 10);
  const user = await prisma.user.create({
    data: {
      username: String(username),
      password: hash,
      nombre: String(nombre),
      email: emailClean,
      rol: role,
      storeId: store.id,
    },
  });
  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res
    .status(201)
    .json({
      user: buildAuthResponse(user, store),
    });
}

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ error: "Credencial de Google requerida" });
  if (!GOOGLE_CLIENT_ID)
    return res
      .status(503)
      .json({ error: "Login con Google no configurado" });
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: String(credential),
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || payload.email_verified !== true)
      return res
        .status(400)
        .json({ error: "El correo de Google no está verificado" });
    const email = String(payload.email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true },
    });
    if (!user || !user.activo)
      return res.status(400).json({
        error: "No existe una cuenta con ese correo. Regístrate primero",
      });
    const token = signToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ user: buildAuthResponse(user, user.store) });
  } catch (err) {
    logger.error("Error en googleLogin:", err.message || err);
    return res.status(400).json({ error: "Credencial de Google inválida" });
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ ok: true });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "El email es requerido" });

  const genericMessage = {
    message:
      "Si el correo existe, te enviamos un enlace para restablecer tu contraseña",
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (!user || !user.activo) return res.json(genericMessage);

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashToken(token),
        resetPasswordExpires: new Date(
          Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000,
        ),
      },
    });

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(user.email, user.nombre, resetLink);
    res.json(genericMessage);
  } catch (err) {
    logger.error("Error en forgotPassword:", err);
    res.status(500).json({ error: "No se pudo procesar la solicitud" });
  }
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ error: "Token y nueva contraseña son requeridos" });
  if (String(newPassword).length < 6)
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 6 caracteres" });

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashToken(String(token)),
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user)
      return res
        .status(400)
        .json({ error: "El enlace es inválido o ha expirado" });

    const hash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    logger.error("Error en resetPassword:", err);
    res.status(500).json({ error: "No se pudo restablecer la contraseña" });
  }
}
