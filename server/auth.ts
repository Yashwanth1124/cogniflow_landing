import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage"; // Replace with your actual storage module
import { User as SelectUser } from "@shared/schema";
import { UserModel } from "./models/user.model";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(
  supplied: string,
  stored: string | undefined,
): Promise<boolean> {
  if (!stored || !supplied) return false;
  const [storedHash, salt] = stored.split(".");
  if (!storedHash || !salt) return false;

  const hashedSupplied = (await scryptAsync(supplied, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "hex");
  return timingSafeEqual(hashedSupplied, storedBuffer);
}

export function setupAuth(app: Express): void {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "cogniflow-super-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore, // Ensure your session store is properly configured
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ username });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid password" });
        }

        // Return user without password
        const safeUser = user.toObject();
        delete safeUser.password;
        return done(null, safeUser);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await UserModel.findOne({ id }).select('-password');
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, user.toJSON());
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser)
        return res.status(400).json({ message: "Username already exists" });

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      if (!req.body.username || !req.body.password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user)
          return res
            .status(401)
            .json({ message: info.message || "Invalid credentials" });

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          const userData = { ...user };
          delete userData.password;
          res.status(200).json(userData);
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}
