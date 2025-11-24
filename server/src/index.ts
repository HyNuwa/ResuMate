// ==================================================
// Importaciones de librerías y módulos necesarios
// ==================================================
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import geoip from 'geoip-lite';
import { Request } from 'express';

// ==================================================
// Importaciones de rutas
// ==================================================

// ==================================================
// Importaciones de utilidades y configuraciones
// ==================================================
import { GeoUtils } from './modules/utils/geo_utils';

// ==================================================
// Extensiones de tipos para librerías externas
// ==================================================

// Extender tipos para geoip-lite
declare module 'geoip-lite' {
  interface Lookup {
    proxy?: boolean;
    timezone: string;
  }
}

// Extender tipos de Express Request
declare global {
  namespace Express {
    interface Request {
      realIp?: string;
      geo?: {
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        loc?: [number, number];
        timezone?: string;
        isProxy?: boolean;
        anonymizedIp?: string;
        org?: string;
      };
    }
  }
}

// ==================================================
// Configuración inicial de la aplicación
// ==================================================
const app = express();
const PORT = /* process.env.PORT || */ 3000;

// ==================================================
// 1. Middlewares de seguridad básicos
// Configuración inicial
// ==================================================
app.set('trust proxy', true);
app.use(helmet()); // Seguridad de cabeceras HTTP
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',           // App principal de usuarios
    'http://localhost:5174',                                     // App principal en puerto alternativo
    process.env.ADMIN_CLIENT_URL || 'http://localhost:5175',     // App de dashboard admin
    'http://localhost:3000'  // Para desarrollo local adicional
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-For', 'Range', 'Accept-Ranges'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware para parsear cookies

// ==================================================
// 2. Limitador de peticiones para API pública
// Rate limiting con validación reforzada de IP
// ==================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return GeoUtils.getValidIP(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas peticiones. Intente nuevamente en 15 minutos.',
      ip: GeoUtils.getValidIP(req),
      timestamp: new Date().toISOString()
    });
  }
});

// ==================================================
// 3. Configuración de sesiones seguras
// ==================================================
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'sessionId',
  rolling: true
};

// Solo usar PostgreSQL store en producción si está configurado
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  try {
    const pgSession = require('connect-pg-simple')(session);
    sessionConfig.store = new pgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions'
    });
    console.log('✅ Session store: PostgreSQL');
  } catch (error) {
    console.warn('⚠️  PostgreSQL session store no disponible, usando MemoryStore');
  }
} else {
  console.log('ℹ️  Session store: MemoryStore (desarrollo)');
}

app.use(session(sessionConfig));

// ==================================================
// 4. Middleware de geolocalización mejorado
// ==================================================
app.use(async (req: Request, res, next) => {
  try {
    const ip = GeoUtils.getValidIP(req);
    req.realIp = ip;

    // Obtener datos geográficos usando GeoUtils
    const geoData = await GeoUtils.getGeoData(ip);

    // Añadir datos al request
    req.geo = {
      ip: geoData.ip,
      city: geoData.city,
      region: geoData.region,
      country: geoData.country,
      loc: geoData.loc,
      timezone: geoData.timezone,
      isProxy: geoData.isProxy,
      anonymizedIp: geoData.anonymizedIp,
      org: geoData.org
    };

    // Mostrar en formato de tablas
    console.log('\n══════════════════════════════════════════════════');
    console.log('           DATOS DE CONEXIÓN            ');
    console.log('══════════════════════════════════════════════════');
    console.table([{
      'IP': GeoUtils.shouldAnonymize() ? req.geo.anonymizedIp : req.geo.ip,
      'Ciudad': req.geo.city,
      'Región': req.geo.region,
      'País': req.geo.country,
      'Coordenadas': req.geo.loc ? `Lat: ${req.geo.loc[0]}, Lon: ${req.geo.loc[1]}` : 'N/A'
    }]);
    console.table([{
      'Zona Horaria': req.geo.timezone,
      'Proxy': req.geo.isProxy ? '✅ Sí' : '❌ No',
      'ISP': req.geo.org || 'N/A',
      'Método': req.method,
      'Endpoint': req.originalUrl
    }]);
    console.log('══════════════════════════════════════════════════');
    
    next();
    
  } catch (error) {
    console.error('\n⚠️  Error en geolocalización:', error);
    req.geo = GeoUtils.getDefaultGeoData(req.realIp);
    next();
  }
});

// ==================================================
// 5. Configuración de Passport (Autenticación)
// ==================================================
app.use(passport.initialize());
app.use(passport.session());

// ==================================================
// 6. Headers de seguridad adicionales
// ==================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// ==================================================
// 7. Sistema de enrutamiento
// ==================================================


// --------------------------
// 7.1 Rutas de Autenticación
// --------------------------
// EN UN FUTURO TAL VES

// --------------------------
// 7.2 Rutas
// --------------------------

// CUIDADO CON EL ORDEN DE LAS RUTAS


// Endpoint de estado del sistema
app.get('/api/status', (req: Request, res) => {
  res.json({
    status: 'OK',
    entorno: process.env.NODE_ENV,
    ipCliente: GeoUtils.shouldAnonymize() ? req.geo?.anonymizedIp : req.realIp,
    geolocalizacion: req.geo,
    servicios: {
      baseDatos: 'conectada',
      autenticacion: 'activa',
      geo: req.geo?.country !== 'XX' ? 'activo' : 'inactivo',
      geoProvider: GeoUtils.checkServiceStatus() === 'active' ? 'ipinfo.io' : 'geoip-lite'
    }
  });
});

// ==================================================
// 8. Manejo de errores global
// ==================================================
app.use((err: any, req: Request, res: express.Response, next: express.NextFunction) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    endpoint: req.originalUrl,
    método: req.method,
    ip: req.realIp,
    error: {
      mensaje: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      código: err.code,
      detalles: err.errors
    }
  };
  
  console.error('Error global:', errorData);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    referencia: errorData.timestamp,
    ...(process.env.NODE_ENV === 'development' && { detalles: errorData })
  });
});

// ==================================================
// 9. Configuración del servidor web
// ==================================================
const server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log('Entorno:', process.env.NODE_ENV || 'development');
  console.log('Estado geolocalización:', GeoUtils.checkServiceStatus());
});

// ==================================================
// Funciones auxiliares
// ==================================================
// ELIMINADA - función getValidIP ya está en GeoUtils

// ==================================================
// Manejo de rutas no encontradas (404)
// ==================================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    método: req.method,
    ruta: req.originalUrl
  });
});