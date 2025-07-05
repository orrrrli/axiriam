import express from 'express';
import { supabase } from '../server.js'; // ajusta la ruta si tu server está en otro lugar

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

router.post('/logout', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required for logout' });
  }

  const { error } = await supabase.auth.signOut({
    scope: 'global',
    refreshToken: refresh_token,
  });

  if (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }

  res.json({ message: 'Logged out successfully' });
});

export default router;
