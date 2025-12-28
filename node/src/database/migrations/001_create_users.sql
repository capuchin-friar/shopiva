CREATE TABLE users (
  -- Identity & Profile
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'entrepreneur', 'admin')),
  fname VARCHAR(100) NOT NULL,
  lname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  gender VARCHAR(50),
  photo TEXT,
  location JSONB DEFAULT '{"city": null, "state": null, "country": null, "zipcode": null}',
  dateOfBirth DATE,

  -- Authentication & Security
  password VARCHAR(255) NOT NULL,
  twoFactorEnabled BOOLEAN DEFAULT false,
  verificationCode VARCHAR(6),
  resetPasswordToken TEXT,
  loginAttempts JSONB DEFAULT '{"count": 0, "lastAttempt": null, "history": []}',

  -- Account Status
  isActive BOOLEAN DEFAULT true,
  isVerified BOOLEAN DEFAULT false,
  isEmailVerified BOOLEAN DEFAULT false,
  isPhoneVerified BOOLEAN DEFAULT false,
  accountStatus VARCHAR(50) DEFAULT 'active' CHECK (accountStatus IN ('active', 'suspended', 'banned', 'deleted')),
  status JSONB DEFAULT '{
    "active": {"enabled": true, "history": []},
    "deleted": {"enabled": false, "history": []},
    "suspended": {"enabled": false, "reason": null, "history": []},
    "banned": {"enabled": false, "reason": null, "history": []},
    "recreated": {"enabled": false, "history": []}
  }',

  -- Device & Notifications
  deviceId VARCHAR(255),
  deviceToken JSONB VARCHAR '[]',
  notificationPreferences JSONB DEFAULT '{
    "email": {"enabled": true, "marketing": false, "updates": true},
    "sms": {"enabled": true, "critical": true},
    "push": {"enabled": true, "marketing": false}
  }',
  preferredLanguage VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Activity Tracking
  lastLogin TIMESTAMP,
  lastseen TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Optional Fields
  socialLinks JSONB DEFAULT '{"linkedin": null, "twitter": null, "instagram": null}',
  profileCompletion INTEGER DEFAULT 0 CHECK (profileCompletion >= 0 AND profileCompletion <= 100)
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_isActive ON users(isActive);
CREATE INDEX idx_users_createdAt ON users(createdAt);
CREATE INDEX idx_users_lastLogin ON users(lastLogin);