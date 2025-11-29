import { loginUser } from "./auth.service.js";

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result, // includes token, user info
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message });
  }
}
