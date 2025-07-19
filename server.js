import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import dotenv from 'dotenv';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024, // 10KB limit to prevent large payload attacks
  maxParamLength: 100, // Prevent long URL abuse
  keepAliveTimeout: 5, // Protect against slow-loris
  requestTimeout: 5000  // Drop slow requests after 5 seconds
});

// Register plugins
async function registerPlugins() {
  await fastify.register(cors, {
    origin: true,
    credentials: true
  });

  await fastify.register(jwt, {
    secret: JWT_SECRET
  });

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist'),
    prefix: '',
  });

  await fastify.register(cookie);

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    ban: 3,
    allowList: (req, key) => req.ip === '127.0.0.1' || req.ip === '::1',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    }
  });
}

// Authentication decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// API Routes
async function registerRoutes() {
  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  fastify.post('/api/admin/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    },
    preValidation: (request, reply, done) => {
      const { username, password } = request.body || {};
      if (!username || !password || username.length > 50 || password.length > 50) {
        return reply.code(400).send({ error: 'Invalid request format' });
      }
      done();
    }
  }, async (request, reply) => {
    const { username, password } = request.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = fastify.jwt.sign(
        { 
          username,
          role: 'admin',
          loginTime: new Date().toISOString()
        },
        { expiresIn: '24h' }
      );

      reply.setCookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      return { 
        success: true, 
        message: 'Login successful',
        token,
        expiresIn: '24h'
      };
    } else {
      reply.code(401);
      return { 
        success: false, 
        message: 'Invalid credentials' 
      };
    }
  });

  fastify.post('/api/admin/logout', async (request, reply) => {
    reply.clearCookie('admin_token');
    return { success: true, message: 'Logged out successfully' };
  });

  fastify.get('/api/admin/verify', { preHandler: [fastify.authenticate] }, async (request) => {
    return { 
      success: true, 
      user: {
        username: request.user.username,
        role: request.user.role,
        loginTime: request.user.loginTime
      }
    };
  });

  fastify.get('/api/admin/data', { preHandler: [fastify.authenticate] }, async () => {
    return {
      success: true,
      data: {
        totalUsers: Math.floor(Math.random() * 10000) + 1000,
        activeStreams: Math.floor(Math.random() * 100) + 10,
        serverUptime: process.uptime(),
        lastUpdated: new Date().toISOString()
      }
    };
  });

  // SPA catch-all handler
  fastify.setNotFoundHandler(async (request, reply) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');

    try {
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf8');
        reply.type('text/html').send(html);
      } else {
        reply.code(404).send({ error: 'Application not built. Run "npm run build" first.' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  if (error.validation) {
    reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  } else if (error.statusCode) {
    reply.code(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message
    });
  } else {
    reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`);
  fastify.close(() => {
    fastify.log.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ 
      port: PORT, 
      host: HOST 
    });

    fastify.log.info(`🚀 LunaStream server running on http://${HOST}:${PORT}`);
    fastify.log.info(`📊 Admin panel available at http://${HOST}:${PORT}/admin`);
    fastify.log.info(`🔐 Admin credentials: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
