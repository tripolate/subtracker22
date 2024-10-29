import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  renewalReminders: z.number().int().min(1).max(30),
  trialReminders: z.number().int().min(1).max(30),
});

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = settingsSchema.parse(req.body);

    const settings = await prisma.userSettings.update({
      where: { userId: req.user.id },
      data: validatedData
    });

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;