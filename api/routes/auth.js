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

export default router;
